# NeuroTravel - Neurodivergent-Friendly Travel App

A web application designed to help neurodivergent individuals and their caregivers find safe, comfortable spaces for travel and daily activities.

## Features

- **Sensory-Friendly Filtering**: Find locations based on crowd levels, noise levels, and sensory accommodations
- **Community-Driven**: Reviews and ratings from people who understand neurodivergent needs
- **Search Functionality**: Find specific locations by name, address, or review content
- **Accessibility-First Design**: High contrast, keyboard navigation, and screen reader friendly

## File Structure

```
travel-app/
├── index.html       # Main HTML structure
├── style.css        # Styling and layout
├── script.js        # JavaScript functionality
├── locations.json   # Location data
└── README.md        # This file
```

## Usage

1. **Download or clone** all files to a folder
2. **Open `index.html`** in your web browser
3. **Browse locations** using the filter buttons:
   - 🤫 **Quiet Spaces**: Low noise environments
   - 👥 **Low Crowd**: Less crowded locations
   - 🧠 **Sensory-Friendly**: Accommodating environments
4. **Search** for specific locations or features
5. **View ratings** for crowd levels and noise levels

## Location Data Format

Each location includes:
- **Name**: Location name
- **Address**: Full address
- **Crowd Level**: 1-5 scale (1 = very quiet, 5 = very crowded)
- **Noise Level**: 1-5 scale (1 = very quiet, 5 = very loud)
- **Sensory Friendly**: Boolean (true/false)
- **Review**: Community review with helpful details

## Adding New Locations

To add new locations:
1. Edit `locations.json`
2. Add a new object following the existing format
3. Include honest, helpful reviews about sensory aspects

## Technical Details

- **No external dependencies**: Runs completely offline
- **Responsive design**: Works on desktop and mobile
- **WCAG compliant**: Meets accessibility standards
- **Progressive enhancement**: Works even if JavaScript fails

## Contributing

This is an MVP (Minimum Viable Product) designed to be:
- Simple to use
- Easy to modify
- Accessible to all users
- Community-driven

## Future Enhancements

- User-submitted reviews
- Map integration (Google Maps API)
- Mobile app version
- More filtering options
- Location photos
- Real-time crowd data

---

**Made with 💙 for inclusive travel**

*This app prioritizes the needs of neurodivergent travelers and their families.*