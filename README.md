# Rajasthan Royals - Auction Intelligence Dashboard 2027

A professional IPL cricket analytics dashboard built with React, designed to match the Power BI reference design. This dashboard provides comprehensive analytics for the Rajasthan Royals team, focusing on player performance, auction strategy, and match insights for IPL 2027.

![Dashboard Preview](https://img.shields.io/badge/Status-Production_Ready-success)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![Vite](https://img.shields.io/badge/Vite-5.4.2-646CFF)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.11-38B2AC)

## 🏏 Features

### 1. Home Dashboard
- **Featured Player Statistics**: Purple gradient card showcasing top performer with key metrics
- **Top Batting Performers**: Rankings with runs, strike rate, and averages
- **Top Bowling Performers**: Rankings with wickets, economy, and strike rates
- **Recent Fixtures & Results**: Live match updates and historical results
- **Points Table**: Real-time IPL standings with team rankings
- **Squad Overview**: Quick stats on active players

### 2. Batting Analytics
- **Top 10 Uncapped Batsmen**: Detailed performance analysis
- **Key Metrics**: Runs, batting average, strike rate, boundaries
- **Interactive Charts**: Performance comparison visualizations
- **Search & Filter**: Find players by name and sort by various metrics
- **Consistency Metrics**: Dot ball percentage and impact scores
- **Detailed Statistics Table**: Comprehensive batting statistics

### 3. Bowling Analytics
- **Top 10 Uncapped Bowlers**: In-depth bowling performance
- **Key Metrics**: Wickets, economy rate, bowling average, strike rate
- **Interactive Charts**: Wickets comparison and economy analysis
- **Search & Filter**: Advanced filtering options
- **Consistency Metrics**: Dot ball percentage tracking
- **Detailed Statistics Table**: Complete bowling analytics

### 4. Pressure Analytics
- **Phase-wise Analysis**: Powerplay (1-6), Middle (7-15), Death (16-20) overs
- **Methodology Documentation**: Detailed explanation of pressure scenarios
- **Performance Comparison**: Visual charts comparing all phases
- **Death Over Specialists**: Top batsmen and bowlers in high-pressure situations
- **Key Performance Indicators**: Run rates, boundaries, wickets per phase

### 5. Auction Strategy
- **Squad Requirements Analysis**: Detailed breakdown by role
- **Top Auction Recommendations**: Priority targets with rationale
- **Role-based Targeting**: Openers, middle-order, finishers, bowlers, all-rounders
- **Impact Scores**: Calculated metrics for player value
- **Priority Classification**: High/Medium/Low priority recommendations
- **Budget Planning**: Strategic auction approach
- **Rationale for Each Pick**: Detailed reasoning for player selection

## 🎨 Design Features

### Visual Design (Matching Power BI Reference)
- ✅ Blue horizontal navigation header
- ✅ Three-column dashboard layout
- ✅ White/light grey background
- ✅ Rounded cards with subtle shadows
- ✅ Purple gradient featured player card
- ✅ Compact professional tables
- ✅ Smooth scrolling and transitions
- ✅ Responsive design for all screen sizes
- ✅ Clean spacing and typography
- ✅ Team colors (Blue #0B2B5C, Pink #EC008C, Purple #7B3FF2)

### UI Components
- Professional stat cards with icons
- Interactive data tables with hover effects
- Responsive charts (Bar, Line, Pie)
- Search and filter functionality
- Priority badges and status indicators
- Gradient backgrounds for emphasis
- Loading states and error handling

## 🚀 Technology Stack

- **React 18.3.1**: Modern UI framework
- **Vite 5.4.2**: Lightning-fast build tool
- **Tailwind CSS 3.4.11**: Utility-first CSS framework
- **React Router 6.26**: Client-side routing
- **Recharts 2.12.7**: Data visualization library
- **PapaParse 5.4.1**: CSV parsing library
- **Lucide React 0.446.0**: Beautiful icon set

## 📊 Data Integration

The dashboard uses real cricket data from the following CSV files:

- `ball_by_ball.csv` (201,000 rows): Ball-by-ball match data
- `matches.csv` (884 rows): Match results and details
- `playing_eleven.csv` (28,382 rows): Playing XI for each match
- `competition_team_player_mapping.csv` (6,414 rows): Player-team associations
- `competitions.csv` (142 rows): Competition details
- `teams.csv` (354 rows): Team information

### Analytics Functions

- **Batting Statistics**: Runs, average, strike rate, boundaries, consistency
- **Bowling Statistics**: Wickets, economy, average, strike rate, dot balls
- **Uncapped Players**: Identification and filtering of non-IPL players
- **Pressure Situations**: Performance in powerplay, middle, and death overs
- **Points Table**: Real-time IPL standings calculation
- **Impact Scores**: Custom metrics for player evaluation

## 📦 Installation

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Setup Instructions

1. **Navigate to the dashboard directory:**
   ```bash
   cd "/Users/sujaldas/Desktop/6af3166e7b922_data_pack 2/rr-dashboard"
   ```

2. **Install dependencies** (Already completed):
   ```bash
   npm install
   ```

3. **Verify data files** (Already in place):
   - CSV files are located in `public/data/`
   - All required files are present

4. **Start the development server** (Already running):
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   - Visit: http://localhost:3000
   - The dashboard should load automatically

## 🎯 Usage

### Navigation
- **Home**: Overview dashboard with key metrics
- **Batting**: Detailed batting analytics and rankings
- **Bowling**: Comprehensive bowling performance analysis
- **Pressure**: Situation-based performance metrics
- **Auction Strategy**: Squad requirements and player recommendations

### Features by Page

#### Home Dashboard
- View featured player with large statistics card
- Check recent fixtures and match results
- Monitor points table standings
- See top performers at a glance

#### Batting Analytics
- Search for specific batsmen
- Sort by runs, average, strike rate, or boundaries
- View interactive performance charts
- Analyze top 10 uncapped batsmen
- Check detailed statistics table

#### Bowling Analytics
- Search for specific bowlers
- Sort by wickets, economy, average, or strike rate
- Compare wickets and economy rates visually
- Identify top 10 uncapped bowlers
- Review comprehensive bowling stats

#### Pressure Analytics
- Understand pressure methodology
- Compare performance across match phases
- Identify death over specialists (batting)
- Find clutch bowlers for high-pressure situations
- Analyze phase-wise statistics

#### Auction Strategy
- Review squad requirements by role
- Check top auction recommendations
- See priority classifications
- Understand player rationale
- Plan auction budget allocation

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to customize team colors:
```javascript
colors: {
  'rr-blue': '#0B2B5C',
  'rr-pink': '#EC008C',
  'rr-purple': '#7B3FF2',
}
```

### Analytics
Modify `src/utils/analytics.js` to adjust:
- Qualification criteria (minimum balls/overs)
- Impact score calculations
- Ranking algorithms
- Statistical thresholds

## 📱 Responsive Design

The dashboard is fully responsive and optimized for:
- **Desktop**: 1440px+ (optimal viewing)
- **Laptop**: 1024px - 1439px
- **Tablet**: 768px - 1023px
- **Mobile**: 320px - 767px

## 🔧 Build for Production

To create a production build:

```bash
npm run build
```

The optimized build will be in the `dist/` directory.

To preview the production build:

```bash
npm run preview
```

## 📊 Performance

- **CSV Loading**: Optimized with PapaParse streaming
- **Data Caching**: React Context API for efficient data management
- **Code Splitting**: React.lazy for route-based splitting
- **Memoization**: useMemo for expensive calculations
- **Responsive Images**: Fallback avatars for missing player photos

## 🐛 Troubleshooting

### Server Won't Start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### CSV Files Not Loading
- Ensure all CSV files are in `public/data/`
- Check browser console for 404 errors
- Verify file names match exactly

### Charts Not Rendering
- Check Recharts is installed: `npm list recharts`
- Ensure chart data is properly formatted
- Verify ResponsiveContainer has height/width

## 🎓 Data Methodology

### Uncapped Players
Players identified as "uncapped" if they haven't played in IPL competitions (comp_id: 1358, 1715, 2193, 2725, 3298).

### Impact Scores

**Batting Impact Score:**
```
Impact Score = (Strike Rate × 0.6) + (Average × 0.4)
```

**Bowling Impact Score:**
```
Impact Score = (Wickets × 20) - (Economy × 5)
```

### Pressure Phases
- **Powerplay**: Overs 1-6 (field restrictions)
- **Middle Overs**: Overs 7-15 (building phase)
- **Death Overs**: Overs 16-20 (high pressure)

### Priority Classification

**High Priority:**
- Batsmen: Strike Rate > 140
- Bowlers: Wickets > 15
- All-Rounders: Automatic

**Medium Priority:**
- Batsmen: Strike Rate 120-140
- Bowlers: Wickets 10-15

**Low Priority:**
- Below medium thresholds

## 📄 License

This project is created for the Rajasthan Royals Auction Intelligence Dashboard. All cricket data is used for analytical purposes.

## 🤝 Contributing

This is a competition project. For questions or improvements, contact the development team.

## 🏆 Credits

**Developed for:** Rajasthan Royals IPL 2027 Auction
**Technology:** React + Vite + Tailwind CSS
**Data Source:** IPL Cricket Dataset (2022-2026)
**Design Reference:** Power BI Dashboard Screenshot

---

**Status:** ✅ Production Ready
**Version:** 1.0.0
**Last Updated:** November 2026

## 🎯 Next Steps

1. **Open the application**: http://localhost:3000
2. **Explore all pages**: Home, Batting, Bowling, Pressure, Auction Strategy
3. **Test search and filters**: Try different sorting and filtering options
4. **Review recommendations**: Check the auction strategy page
5. **Analyze insights**: Use the pressure analytics for match strategy

**The dashboard is now ready for use!** 🎉

Navigate through all sections to explore comprehensive cricket analytics with real data from the CSV files. The interface closely matches the Power BI reference design with a professional, information-rich layout.
