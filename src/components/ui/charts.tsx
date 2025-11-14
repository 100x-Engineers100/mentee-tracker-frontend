import React from 'react';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"; // This imports from the utility file
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface BaseChartProps {
  data: any[];
  index: string;
  colors?: string[];
  valueFormatter?: (value: any) => string;
  className?: string;
}

interface CartesianChartProps extends BaseChartProps {
  type: 'line' | 'area' | 'bar';
  categories: string[];
  stack?: boolean;
}

interface PieChartProps extends BaseChartProps {
  type: 'pie' | 'donut';
  category: string;
}

type EnhancedChartProps = CartesianChartProps | PieChartProps;

// Helper to determine if the chart type is cartesian
const isCartesianChart = (props: EnhancedChartProps): props is CartesianChartProps => {
  return ['line', 'area', 'bar'].includes(props.type);
};

// Helper to determine if the chart type is pie
const isPieChart = (props: EnhancedChartProps): props is PieChartProps => {
  return ['pie', 'donut'].includes(props.type);
};

export const Chart: React.FC<EnhancedChartProps> = (props) => {
  const { data, colors = ['#2563eb', '#4ade80', '#f59e0b', '#ef4444', '#8b5cf6'], valueFormatter } = props;
  
  // Create default formatter if none provided
  const formatter = valueFormatter || ((value: any) => String(value));

  // Convert object data to array for pie/donut charts if needed
  const chartData = Array.isArray(data[0]) ? data[0] : data;

  // Create a chart config for the UI elements
  const chartConfig = colors.reduce((acc, color, index) => {
    acc[`item-${index}`] = { color };
    return acc;
  }, {} as Record<string, { color: string }>);

  if (isCartesianChart(props)) {
    const { type, categories, index, stack } = props;
    
    return (
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={index} />
              <YAxis />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend content={<ChartLegendContent />} />
              {categories.map((category, idx) => (
                <Bar 
                  key={category} 
                  dataKey={category} 
                  fill={colors[idx % colors.length]} 
                  stackId={stack ? 'stack' : undefined}
                />
              ))}
            </BarChart>
          ) : type === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={index} />
              <YAxis />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend content={<ChartLegendContent />} />
              {categories.map((category, idx) => (
                <Line 
                  key={category} 
                  type="monotone" 
                  dataKey={category} 
                  stroke={colors[idx % colors.length]} 
                />
              ))}
            </LineChart>
          ) : (
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={index} />
              <YAxis />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend content={<ChartLegendContent />} />
              {categories.map((category, idx) => (
                <Area 
                  key={category} 
                  type="monotone" 
                  dataKey={category} 
                  fill={colors[idx % colors.length]} 
                  stroke={colors[idx % colors.length]} 
                  stackId={stack ? 'stack' : undefined}
                />
              ))}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </ChartContainer>
    );
  }

  if (isPieChart(props)) {
    const { type, category, index } = props;
    // For pie chart, transform data if it's a single object
    const pieData = Array.isArray(chartData) ? chartData : [chartData];
    
    // Transform object into array format for pie chart if needed
    const transformedData = pieData[0] && typeof pieData[0] === 'object' && !Array.isArray(pieData[0]) 
      ? Object.entries(pieData[0]).map(([name, value]) => ({ name, value }))
      : pieData;

    const innerRadius = type === 'donut' ? '60%' : '0%';
    
    return (
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<ChartTooltipContent />} />
            <Legend content={<ChartLegendContent />} />
            <Pie
              data={transformedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius="80%"
              innerRadius={innerRadius}
              dataKey={category || 'value'}
              nameKey={index || 'name'}
            >
              {transformedData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  }

  return null;
};
