interface StressCircleProps {
  score: number; // 0-100
}

export function StressCircle({ score }: StressCircleProps) {
  const radius = 80;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth / 2;
  
  // Total circle is 342 degrees (95% of 360), leaving 18 degree gap at top
  const maxDegrees = 342;
  const gapDegrees = 18;
  
  // Helper to create SVG arc path
  const createArc = (startPercent: number, endPercent: number) => {
    // Convert percentages to degrees (0-100 maps to 0-342 degrees)
    const startDeg = (startPercent / 100) * maxDegrees;
    const endDeg = (endPercent / 100) * maxDegrees;
    
    // Start at top right (after gap), gap is centered at top (270deg)
    // Circle starts at 270 + (18/2) = 279 degrees and goes 342 degrees
    const offsetAngle = 270 + (gapDegrees / 2); // Start after the gap
    const startAngle = (offsetAngle + startDeg) * (Math.PI / 180);
    const endAngle = (offsetAngle + endDeg) * (Math.PI / 180);
    
    const x1 = radius + normalizedRadius * Math.cos(startAngle);
    const y1 = radius + normalizedRadius * Math.sin(startAngle);
    const x2 = radius + normalizedRadius * Math.cos(endAngle);
    const y2 = radius + normalizedRadius * Math.sin(endAngle);
    
    const largeArcFlag = (endDeg - startDeg) > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${normalizedRadius} ${normalizedRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
  };

  // Color zones - each zone is a percentage range of the 0-100 score
  const colorZones = [
    { start: 0, end: 10, color: '#ef4444' },      // Red
    { start: 10, end: 20, color: '#f97316' },     // Orange
    { start: 20, end: 30, color: '#facc15' },     // Yellow
    { start: 30, end: 65, color: '#22c55e' },     // Green
    { start: 65, end: 100, color: '#3b82f6' },    // Blue
  ];

  // Get classification text
  const getClassification = () => {
    if (score <= 10) return 'Critical Stress';
    if (score <= 25) return 'High Stress';
    if (score <= 40) return 'Moderate Stress';
    if (score <= 55) return 'Fair';
    if (score <= 70) return 'Good';
    if (score <= 85) return 'Very Good';
    return 'Excellent';
  };

  // Get classification color
  const getClassificationColor = () => {
    return '#ffffff'; // Always white
  };

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="relative" style={{ width: radius * 2, height: radius * 2 }}>
        <svg height={radius * 2} width={radius * 2}>
          {/* Background circle */}
          <circle
            stroke="var(--secondary)"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${(normalizedRadius * 2 * Math.PI * maxDegrees) / 360} ${normalizedRadius * 2 * Math.PI}`}
            strokeDashoffset={0}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            transform={`rotate(${270 + gapDegrees / 2} ${radius} ${radius})`}
          />
          
          {/* Color zones - draw each visible zone */}
          {colorZones.map((zone, index) => {
            // Calculate how much of this zone should be visible based on score
            if (score <= zone.start) return null; // Zone not reached yet
            
            const zoneEnd = Math.min(score, zone.end);
            const path = createArc(zone.start, zoneEnd);
            
            return (
              <path
                key={index}
                d={path}
                stroke={zone.color}
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                style={{
                  transition: 'd 0.5s ease'
                }}
              />
            );
          })}
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div 
            style={{ 
              fontSize: '48px',
              fontWeight: 'var(--font-weight-bold)',
              lineHeight: '1',
              color: getClassificationColor()
            }}
          >
            {score}
          </div>
          <p className="text-muted-foreground caption mt-1">Stress Score</p>
        </div>
      </div>
      
      {/* Classification */}
      <div className="mt-4 text-center">
        <p 
          style={{ 
            fontSize: 'var(--text-h3)',
            fontWeight: 'var(--font-weight-semibold)',
            color: getClassificationColor()
          }}
        >
          {getClassification()}
        </p>
      </div>
    </div>
  );
}