// Main plugin code that runs in Figma's sandbox environment

interface TokenValue {
  value: string | number;
  type: string;
  description?: string;
  original?: string;
}

interface TokensJSON {
  meta: {
    version: string;
    source: string;
    generatedAt: string;
  };
  raw: {
    color: Record<string, TokenValue>;
    fontSize: Record<string, TokenValue>;
    spacing: Record<string, TokenValue>;
    fontFamily: Record<string, TokenValue>;
    fontWeight: Record<string, TokenValue>;
    lineHeight: Record<string, TokenValue>;
    letterSpacing: Record<string, TokenValue>;
    borderRadius: Record<string, TokenValue>;
    boxShadow: Record<string, TokenValue>;
    opacity: Record<string, TokenValue>;
  };
  semantic: {
    color: Record<string, any>;
    typography: Record<string, any>;
    spacing: Record<string, any>;
  };
}

// Utility functions
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function rgbaToHex(r: number, g: number, b: number, a: number): string {
  if (a === 1) return rgbToHex(r, g, b);
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
  const alphaHex = Math.round(a * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${alphaHex}`.toUpperCase();
}

function sanitizeName(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s\/]/g, '')
    .replace(/\s+/g, '-')
    .replace(/\//g, '.');
}

function getScanStats() {
    const colorStyles = figma.getLocalPaintStyles();
    const textStyles = figma.getLocalTextStyles();
    const effectStyles = figma.getLocalEffectStyles();

    return {
        colors: colorStyles.length,
        typography: textStyles.length,
        effects: effectStyles.length,
        total: colorStyles.length + textStyles.length + effectStyles.length,
    };
}

function extractColorTokens(): Record<string, TokenValue> {
  const colorTokens: Record<string, TokenValue> = {};
  const paintStyles = figma.getLocalPaintStyles();
  
  paintStyles.forEach(style => {
    const paint = style.paints[0];
    if (paint && paint.type === 'SOLID') {
      const { r, g, b } = paint.color;
      const a = paint.opacity !== undefined ? paint.opacity : 1;
      const hex = a === 1 ? rgbToHex(r, g, b) : rgbaToHex(r, g, b, a);
      
      const tokenName = sanitizeName(style.name);
      colorTokens[tokenName] = {
        value: hex,
        type: 'color',
        description: style.description || `Color token from ${style.name}`,
        original: style.id
      };
    }
  });
  
  return colorTokens;
}

function extractTextTokens(): {
  fontSize: Record<string, TokenValue>;
  fontFamily: Record<string, TokenValue>;
  fontWeight: Record<string, TokenValue>;
  lineHeight: Record<string, TokenValue>;
  letterSpacing: Record<string, TokenValue>;
} {
  const fontSizeTokens: Record<string, TokenValue> = {};
  const fontFamilyTokens: Record<string, TokenValue> = {};
  const fontWeightTokens: Record<string, TokenValue> = {};
  const lineHeightTokens: Record<string, TokenValue> = {};
  const letterSpacingTokens: Record<string, TokenValue> = {};
  
  const textStyles = figma.getLocalTextStyles();
  
  textStyles.forEach(style => {
    const tokenName = sanitizeName(style.name);
    
    // Font Size
    if (typeof style.fontSize === 'number') {
      fontSizeTokens[tokenName] = {
        value: `${style.fontSize}px`,
        type: 'dimension',
        description: `Font size from ${style.name}`,
        original: style.id
      };
    }
    
    // Font Family
    if (typeof style.fontName === 'object' && style.fontName !== null) {
      const fontFamily = style.fontName.family;
      fontFamilyTokens[tokenName] = {
        value: fontFamily,
        type: 'fontFamily',
        description: `Font family from ${style.name}`,
        original: style.id
      };
    }
    
    // Font Weight
    if (typeof style.fontName === 'object' && style.fontName !== null) {
      const fontWeight = style.fontName.style;
      const weightValue = mapFontStyleToWeight(fontWeight);
      fontWeightTokens[tokenName] = {
        value: weightValue,
        type: 'fontWeight',
        description: `Font weight from ${style.name}`,
        original: style.id
      };
    }
    
    // Line Height
    if (typeof style.lineHeight === 'object' && style.lineHeight !== null && 'unit' in style.lineHeight) {
      let lineHeightValue: string;
      
      if (style.lineHeight.unit === 'PERCENT' && 'value' in style.lineHeight) {
        lineHeightValue = ((style.lineHeight as any).value / 100).toString();
      } else if (style.lineHeight.unit === 'PIXELS' && 'value' in style.lineHeight) {
        lineHeightValue = `${(style.lineHeight as any).value}px`;
      } else {
        lineHeightValue = '1.5'; // Default fallback
      }
      
      lineHeightTokens[tokenName] = {
        value: lineHeightValue,
        type: 'lineHeight',
        description: `Line height from ${style.name}`,
        original: style.id
      };
    }
    
    // Letter Spacing
    if (typeof style.letterSpacing === 'object' && style.letterSpacing !== null && 'unit' in style.letterSpacing && 'value' in style.letterSpacing) {
      const letterSpacingValue = (style.letterSpacing as any).unit === 'PERCENT'
        ? `${(style.letterSpacing as any).value}%`
        : `${(style.letterSpacing as any).value}px`;
        
      letterSpacingTokens[tokenName] = {
        value: letterSpacingValue,
        type: 'letterSpacing',
        description: `Letter spacing from ${style.name}`,
        original: style.id
      };
    }
  });
  
  return {
    fontSize: fontSizeTokens,
    fontFamily: fontFamilyTokens,
    fontWeight: fontWeightTokens,
    lineHeight: lineHeightTokens,
    letterSpacing: letterSpacingTokens
  };
}

function mapFontStyleToWeight(style: string): number {
  const weightMap: Record<string, number> = {
    'Thin': 100,
    'Extra Light': 200,
    'ExtraLight': 200,
    'Light': 300,
    'Regular': 400,
    'Medium': 500,
    'Semi Bold': 600,
    'SemiBold': 600,
    'Bold': 700,
    'Extra Bold': 800,
    'ExtraBold': 800,
    'Black': 900
  };
  
  return weightMap[style] || 400;
}

function extractEffectTokens(): {
  boxShadow: Record<string, TokenValue>;
  opacity: Record<string, TokenValue>;
} {
  const boxShadowTokens: Record<string, TokenValue> = {};
  const opacityTokens: Record<string, TokenValue> = {};
  
  const effectStyles = figma.getLocalEffectStyles();
  
  effectStyles.forEach(style => {
    const tokenName = sanitizeName(style.name);
    
    style.effects.forEach((effect, index) => {
      if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
        const { r, g, b } = effect.color;
        const a = effect.color.a || 1;
        const color = rgbaToHex(r, g, b, a);
        
        const shadowValue = `${effect.offset.x}px ${effect.offset.y}px ${effect.radius}px ${effect.spread || 0}px ${color}`;
        const shadowName = index > 0 ? `${tokenName}-${index}` : tokenName;
        
        boxShadowTokens[shadowName] = {
          value: effect.type === 'INNER_SHADOW' ? `inset ${shadowValue}` : shadowValue,
          type: 'boxShadow',
          description: `Shadow from ${style.name}`,
          original: style.id
        };
      }
    });
  });
  
  return { boxShadow: boxShadowTokens, opacity: opacityTokens };
}

function generateSpacingTokens(): Record<string, TokenValue> {
  // Generate a standard spacing scale
  const spacingScale = [4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128];
  const spacingTokens: Record<string, TokenValue> = {};
  
  spacingScale.forEach((value, index) => {
    spacingTokens[`${index + 1}`] = {
      value: `${value}px`,
      type: 'spacing',
      description: `Spacing scale step ${index + 1}`
    };
  });
  
  return spacingTokens;
}

function generateBorderRadiusTokens(): Record<string, TokenValue> {
  // Generate standard border radius tokens
  const radiusScale = [0, 2, 4, 6, 8, 12, 16, 20, 24, 32];
  const radiusTokens: Record<string, TokenValue> = {};
  
  radiusScale.forEach((value, index) => {
    const name = value === 0 ? 'none' : `${index}`;
    radiusTokens[name] = {
      value: `${value}px`,
      type: 'dimension',
      description: `Border radius ${value}px`
    };
  });
  
  return radiusTokens;
}

function generateSemanticTokens(rawTokens: TokensJSON['raw']): TokensJSON['semantic'] {
  // Create semantic mappings based on raw tokens
  const colorKeys = Object.keys(rawTokens.color);
  const fontSizeKeys = Object.keys(rawTokens.fontSize);
  
  return {
    color: {
      brand: {
        primary: colorKeys.length > 0 ? { value: `{raw.color.${colorKeys[0]}}`, type: 'color' } : { value: '#1976D2', type: 'color' },
        secondary: colorKeys.length > 1 ? { value: `{raw.color.${colorKeys[1]}}`, type: 'color' } : { value: '#424242', type: 'color' }
      },
      text: {
        primary: { value: '#111827', type: 'color' },
        secondary: { value: '#6B7280', type: 'color' }
      },
      background: {
        page: { value: '#FFFFFF', type: 'color' },
        surface: { value: '#F9FAFB', type: 'color' }
      }
    },
    typography: {
      heading: {
        h1: fontSizeKeys.length > 0 ? { 
          fontSize: `{raw.fontSize.${fontSizeKeys[0]}}`,
          fontWeight: 700,
          lineHeight: '1.2'
        } : {
          fontSize: '32px',
          fontWeight: 700,
          lineHeight: '1.2'
        }
      },
      body: {
        base: {
          fontSize: '16px',
          fontWeight: 400,
          lineHeight: '1.5'
        }
      }
    },
    spacing: {
      component: {
        padding: '{raw.spacing.3}',
        margin: '{raw.spacing.2}'
      }
    }
  };
}

function generateTokensJSON(): TokensJSON {
  const colorTokens = extractColorTokens();
  const textTokens = extractTextTokens();
  const effectTokens = extractEffectTokens();
  const spacingTokens = generateSpacingTokens();
  const borderRadiusTokens = generateBorderRadiusTokens();
  
  const rawTokens = {
    color: colorTokens,
    fontSize: textTokens.fontSize,
    spacing: spacingTokens,
    fontFamily: textTokens.fontFamily,
    fontWeight: textTokens.fontWeight,
    lineHeight: textTokens.lineHeight,
    letterSpacing: textTokens.letterSpacing,
    borderRadius: borderRadiusTokens,
    boxShadow: effectTokens.boxShadow,
    opacity: effectTokens.opacity
  };
  
  const semanticTokens = generateSemanticTokens(rawTokens);
  
  return {
    meta: {
      version: '1.0.0',
      source: figma.fileKey || 'unknown',
      generatedAt: new Date().toISOString()
    },
    raw: rawTokens,
    semantic: semanticTokens
  };
}

// Main plugin logic
figma.showUI(__html__, { 
  width: 400, 
  height: 600,
  themeColors: true 
});

figma.ui.onmessage = msg => {
  if (msg.type === 'scan-document') {
    try {
        const stats = getScanStats();
        figma.ui.postMessage({
            type: 'scan-complete',
            stats: stats
        });
    } catch (error) {
         figma.ui.postMessage({
            type: 'error',
            message: `Error scanning document: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
    }
  }

  if (msg.type === 'export-tokens') {
    try {
      const tokens = generateTokensJSON();
      
      const stats = {
          colors: Object.keys(tokens.raw.color).length,
          typography: Object.keys(tokens.raw.fontSize).length,
          effects: Object.keys(tokens.raw.boxShadow).length,
          total: Object.keys(tokens.raw.color).length + Object.keys(tokens.raw.fontSize).length + Object.keys(tokens.raw.boxShadow).length
      };

      // Send tokens back to UI
      figma.ui.postMessage({
        type: 'export-result',
        tokens: tokens,
        stats: stats
      });
    } catch (error) {
      figma.ui.postMessage({
        type: 'error',
        message: `Error generating tokens: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }
  
  if (msg.type === 'close-plugin') {
    figma.closePlugin();
  }
};
