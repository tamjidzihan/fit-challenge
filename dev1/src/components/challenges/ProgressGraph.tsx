/* eslint-disable @typescript-eslint/no-explicit-any */
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Entry, Challenge } from '../../types';

interface ProgressGraphProps {
    challenge: Challenge;
    entries: Entry[];
    userId?: string;
}

function ProgressGraph({ challenge, entries, userId }: ProgressGraphProps) {
    // Filter entries by user if userId is provided
    const userEntries = userId
        ? entries.filter(entry => entry.userId === userId)
        : entries;

    // Group entries by date and calculate totals for each field
    const dataByDate: { [key: string]: any } = {};

    userEntries.forEach(entry => {
        if (!dataByDate[entry.date]) {
            dataByDate[entry.date] = { date: entry.date };
        }

        challenge.fields.forEach(field => {
            if (entry.values[field]) {
                if (!dataByDate[entry.date][field]) {
                    dataByDate[entry.date][field] = 0;
                }
                dataByDate[entry.date][field] += Number(entry.values[field]);
            }
        });
    });

    const chartData = Object.values(dataByDate).sort((a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

    if (chartData.length === 0) {
        return (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                    No data available for the graph. Add some entries to see your progress!
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-1 lg:p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Progress Overview
            </h3>

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                            labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`}
                            formatter={(value: number, name: string) => [value, name]}
                            contentStyle={{
                                backgroundColor: 'var(--bg-color, white)',
                                borderColor: 'var(--border-color, #e5e7eb)'
                            }}
                        />
                        <Legend />
                        {challenge.fields.map((field, index) => (
                            <Line
                                key={field}
                                type="monotone"
                                dataKey={field}
                                stroke={colors[index % colors.length]}
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default ProgressGraph;