# Design Tokens Exporter - Figma Plugin

A comprehensive Figma plugin that extracts design tokens from your Figma styles and exports them as structured JSON, ready for use in your development workflow.

## 🚀 Features

- **Complete Style Extraction**: Automatically extracts colors, typography, effects, and spacing from Figma styles
- **Structured JSON Output**: Generates clean, well-structured JSON with raw and semantic token categories
- **Flexible Export Options**: Choose between nested or flattened JSON structure
- **Developer-Ready**: Output is optimized for transformation into CSS variables, SCSS maps, TypeScript objects, and more
- **Semantic Mapping**: Automatically creates semantic tokens that reference raw values
- **Accessibility Support**: Includes proper color contrast considerations in token structure

## 📦 Installation

### Development Setup

1. Clone this repository:
```bash
git clone <repository-url>
cd design-tokens-exporter
```

2. Install dependencies:
```bash
npm install
```

3. Build the plugin:
```bash
npm run build
```

4. In Figma, go to `Plugins` > `Development` > `Import plugin from manifest`
5. Select the `manifest.json` file from this directory

### Production Installation

1. Search for "Design Tokens Exporter" in the Figma Community plugins
2. Click "Install" to add it to your Figma account

## 🎯 Usage

### Basic Export

1. Open your Figma file with defined styles (Colors, Text styles, Effects)
2. Go to `Plugins` > `Design Tokens Exporter`
3. Click "🚀 Generate Tokens JSON"
4. Review the discovered styles and preview the generated JSON
5. Click "💾 Download JSON File" to save your tokens

### Export Options

- **Format Structure**: Choose between nested JSON (recommended) or flattened keys
- **Include Options**: 
  - Metadata (version, source, generation date)
  - Figma style IDs (for traceability)
  - Token descriptions

### Generated JSON Structure

The plugin generates a comprehensive tokens file with this structure:

```json
{
  "meta": {
    "version": "1.0.0",
    "source": "figma-file-id",
    "generatedAt": "2025-01-01T00:00:00Z"
  },
  "raw": {
    "color": {
      "blue-500": { "value": "#1976D2", "type": "color" }
    },
    "fontSize": {
      "heading-large": { "value": "32px", "type": "dimension" }
    },
    "spacing": {
      "1": { "value": "4px", "type": "spacing" }
    }
  },
  "semantic": {
    "color": {
      "brand": {
        "primary": { "value": "{raw.color.blue-500}", "type": "color" }
      }
    },
    "typography": {
      "heading": {
        "h1": { 
          "fontSize": "{raw.fontSize.heading-large}",
          "fontWeight": 700,
          "lineHeight": "1.2"
        }
      }
    }
  }
}
```

## 🛠 Development Workflow Integration

### CSS Variables Generation

Use the exported JSON to generate CSS custom properties:

```css
:root {
  --color-brand-primary: #1976D2;
  --color-text-primary: #111827;
  --spacing-1: 4px;
  --font-size-base: 16px;
}
```

### SCSS Maps

Transform into SCSS variables and maps:

```scss
$tokens: (
  color: (
    primary: #1976D2
  ),
  spacing: (
    1: 4px,
    2: 8px
  )
);
```

### TypeScript Objects

Create typed token objects for React/Angular:

```typescript
export const tokens = {
  colors: { primary: '#1976D2' },
  spacing: { sm: '8px' }
};

export type Tokens = typeof tokens;
```

### Build Pipeline Integration

1. Export tokens from Figma using this plugin
2. Commit the JSON file to your repository
3. Use build scripts to transform into platform-specific formats
4. Integrate with your CI/CD pipeline for automatic updates

## 📋 Token Categories

The plugin extracts and organizes these token types:

- **Colors**: Brand colors, neutrals, semantic colors from paint styles
- **Typography**: Font families, sizes, weights, line heights, letter spacing
- **Spacing**: Standard spacing scale (4px, 8px, 16px, etc.)
- **Border Radius**: Corner radius values
- **Shadows**: Drop shadows and inner shadows from effect styles
- **Opacity**: Alpha transparency values

## 🎨 Best Practices

### Figma Setup

1. **Use Named Styles**: Create consistent color, text, and effect styles
2. **Semantic Naming**: Use descriptive names like "Primary", "Success", "Heading Large"
3. **Consistent Scales**: Follow systematic scales for spacing and typography
4. **Document Styles**: Add descriptions to your Figma styles for better token documentation

### Token Organization

1. **Raw vs Semantic**: Keep color palette values in raw tokens, use semantic tokens for component-specific usage
2. **Aliasing**: Use token references (`{raw.color.blue-500}`) to maintain relationships
3. **Versioning**: Version your token files and maintain a changelog for updates

## 🔧 Advanced Configuration

### Custom Spacing Scales

The plugin generates a standard spacing scale, but you can modify the generated JSON to match your design system:

```json
"spacing": {
  "xs": { "value": "4px", "type": "spacing" },
  "sm": { "value": "8px", "type": "spacing" },
  "md": { "value": "16px", "type": "spacing" },
  "lg": { "value": "24px", "type": "spacing" },
  "xl": { "value": "32px", "type": "spacing" }
}
```

### Dark Mode Support

Structure your tokens to support theming:

```json
"themes": {
  "light": {
    "semantic.color.background": "{raw.color.white}"
  },
  "dark": {
    "semantic.color.background": "{raw.color.gray.900}"
  }
}
```

## 🐛 Troubleshooting

### Common Issues

**No styles detected**: Ensure you have created color, text, or effect styles in your Figma file

**Missing token values**: Check that your Figma styles use supported properties (solid colors, standard text properties)

**Export fails**: Verify you have proper permissions to access the Figma file

### Plugin Limitations

- Only extracts local styles (not from external libraries)
- Gradients are not currently supported (solid colors only)
- Complex text formatting may be simplified

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Submit a pull request with a clear description

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built following the comprehensive guide for Design Tokens JSON
- Inspired by the Design Tokens Community Group specifications
- Uses Figma Plugin API for style extraction

---

**Need help?** Create an issue in this repository or refer to the [Figma Plugin documentation](https://www.figma.com/plugin-docs/) for API details.