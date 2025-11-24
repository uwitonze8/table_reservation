'use client';

import { useState, useEffect } from 'react';

export interface Table {
  id: string;
  number: number;
  seats: number;
  position: { x: number; y: number };
  shape: 'square' | 'round' | 'rectangle';
  status: 'available' | 'reserved' | 'occupied';
  location: 'window' | 'center' | 'patio' | 'bar';
}

interface TableLayoutProps {
  selectedDate?: string;
  selectedTime?: string;
  selectedGuests?: number;
  onTableSelect: (table: Table) => void;
  selectedTableId?: string;
}

// Mock restaurant layout
const restaurantTables: Table[] = [
  // Window Tables (Left side)
  { id: 'T1', number: 1, seats: 2, position: { x: 5, y: 10 }, shape: 'square', status: 'available', location: 'window' },
  { id: 'T2', number: 2, seats: 2, position: { x: 5, y: 30 }, shape: 'square', status: 'available', location: 'window' },
  { id: 'T3', number: 3, seats: 4, position: { x: 5, y: 50 }, shape: 'rectangle', status: 'reserved', location: 'window' },
  { id: 'T4', number: 4, seats: 4, position: { x: 5, y: 70 }, shape: 'rectangle', status: 'available', location: 'window' },

  // Center Tables
  { id: 'T5', number: 5, seats: 4, position: { x: 25, y: 15 }, shape: 'round', status: 'available', location: 'center' },
  { id: 'T6', number: 6, seats: 6, position: { x: 25, y: 40 }, shape: 'round', status: 'occupied', location: 'center' },
  { id: 'T7', number: 7, seats: 4, position: { x: 25, y: 65 }, shape: 'round', status: 'available', location: 'center' },

  { id: 'T8', number: 8, seats: 2, position: { x: 45, y: 10 }, shape: 'square', status: 'available', location: 'center' },
  { id: 'T9', number: 9, seats: 4, position: { x: 45, y: 30 }, shape: 'rectangle', status: 'available', location: 'center' },
  { id: 'T10', number: 10, seats: 6, position: { x: 45, y: 55 }, shape: 'round', status: 'available', location: 'center' },
  { id: 'T11', number: 11, seats: 2, position: { x: 45, y: 78 }, shape: 'square', status: 'reserved', location: 'center' },

  // Window Tables (Right side)
  { id: 'T12', number: 12, seats: 2, position: { x: 70, y: 10 }, shape: 'square', status: 'available', location: 'window' },
  { id: 'T13', number: 13, seats: 4, position: { x: 70, y: 30 }, shape: 'rectangle', status: 'available', location: 'window' },
  { id: 'T14', number: 14, seats: 2, position: { x: 70, y: 50 }, shape: 'square', status: 'occupied', location: 'window' },
  { id: 'T15', number: 15, seats: 4, position: { x: 70, y: 70 }, shape: 'rectangle', status: 'available', location: 'window' },

  // Patio Tables (Bottom)
  { id: 'T16', number: 16, seats: 4, position: { x: 15, y: 88 }, shape: 'round', status: 'available', location: 'patio' },
  { id: 'T17', number: 17, seats: 4, position: { x: 35, y: 88 }, shape: 'round', status: 'available', location: 'patio' },
  { id: 'T18', number: 18, seats: 6, position: { x: 55, y: 88 }, shape: 'round', status: 'available', location: 'patio' },

  // Bar Tables (Top)
  { id: 'T19', number: 19, seats: 2, position: { x: 25, y: 2 }, shape: 'square', status: 'available', location: 'bar' },
  { id: 'T20', number: 20, seats: 2, position: { x: 45, y: 2 }, shape: 'square', status: 'reserved', location: 'bar' },
];

export default function TableLayout({ selectedDate, selectedTime, selectedGuests, onTableSelect, selectedTableId }: TableLayoutProps) {
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);

  // Filter tables based on guest count - show tables matching the guest number
  const getFilteredTables = () => {
    if (!selectedGuests) return restaurantTables;

    // Find the minimum table size that can accommodate the guests
    // Available table sizes: 2, 4, 6
    let targetSeats;
    if (selectedGuests <= 2) targetSeats = 2;
    else if (selectedGuests <= 4) targetSeats = 4;
    else targetSeats = 6; // 5, 6, 7, 8, 9, 10+ guests

    // Show only tables with the target seat count
    return restaurantTables.filter(table => table.seats === targetSeats);
  };

  const tables = getFilteredTables();

  // Get table status (simplified since we're only showing suitable tables)
  const getTableStatus = (table: Table) => {
    if (table.status === 'occupied') return 'occupied';
    if (table.status === 'reserved') return 'reserved';
    return 'available';
  };

  const getTableColor = (table: Table) => {
    const status = getTableStatus(table);
    if (selectedTableId === table.id) return '#FF6B35'; // Selected - Orange
    if (status === 'available') return '#4ade80'; // Available - Green
    if (status === 'reserved') return '#fbbf24'; // Reserved - Yellow
    if (status === 'occupied') return '#ef4444'; // Occupied - Red
    return '#9ca3af';
  };

  const getTableSize = (shape: string, seats: number) => {
    if (shape === 'square') return { width: 50, height: 50 };
    if (shape === 'round') return { width: 60, height: 60 };
    if (shape === 'rectangle') return { width: 70, height: 50 };
    return { width: 50, height: 50 };
  };

  const handleTableClick = (table: Table) => {
    const status = getTableStatus(table);
    if (status === 'available') {
      onTableSelect(table);
    }
  };

  const isTableClickable = (table: Table) => {
    const status = getTableStatus(table);
    return status === 'available';
  };

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-[#333333]">Select Your Table</h3>
        {selectedGuests && (
          <span className="text-xs text-[#333333] opacity-70">
            Showing tables for {selectedGuests} {selectedGuests === 1 ? 'guest' : 'guests'}
          </span>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-400"></div>
          <span className="text-[#333333]">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#FF6B35]"></div>
          <span className="text-[#333333]">Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-yellow-400"></div>
          <span className="text-[#333333]">Reserved</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span className="text-[#333333]">Occupied</span>
        </div>
      </div>

      {/* Restaurant Layout */}
      <div className="relative bg-[#F8F4F0] rounded-lg p-3" style={{ height: '450px' }}>
        {/* Bar Area Label */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-[#333333] text-white px-3 py-0.5 rounded-b-lg text-xs font-semibold">
          Bar Area
        </div>

        {/* Window Labels */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -rotate-90 bg-[#333333] text-white px-3 py-0.5 rounded-lg text-xs font-semibold">
          Window View
        </div>
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 rotate-90 bg-[#333333] text-white px-3 py-0.5 rounded-lg text-xs font-semibold">
          Window View
        </div>

        {/* Patio Label */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-[#333333] text-white px-3 py-0.5 rounded-t-lg text-xs font-semibold">
          Patio Area
        </div>

        {/* Entrance */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <svg className="w-4 h-4 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-xs font-semibold text-[#333333]">Entrance</span>
        </div>

        {/* Kitchen */}
        <div className="absolute bottom-3 right-3 bg-gray-300 px-3 py-1 rounded-lg text-xs font-semibold text-[#333333]">
          Kitchen
        </div>

        {/* Tables */}
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          {tables.map((table) => {
            const size = getTableSize(table.shape, table.seats);
            const color = getTableColor(table);
            const status = getTableStatus(table);
            const isClickable = isTableClickable(table);
            const isHovered = hoveredTable === table.id;
            const isSelected = selectedTableId === table.id;

            return (
              <g
                key={table.id}
                transform={`translate(${table.position.x}, ${table.position.y})`}
                onClick={() => handleTableClick(table)}
                onMouseEnter={() => setHoveredTable(table.id)}
                onMouseLeave={() => setHoveredTable(null)}
                style={{ cursor: isClickable ? 'pointer' : 'not-allowed' }}
                className="transition-all duration-200"
              >
                {/* Table Shape */}
                {table.shape === 'square' && (
                  <rect
                    width={size.width / 10}
                    height={size.height / 10}
                    fill={color}
                    stroke={isHovered || isSelected ? '#333333' : 'transparent'}
                    strokeWidth={isHovered || isSelected ? '0.3' : '0'}
                    rx="0.5"
                    opacity={isHovered ? 0.9 : 1}
                    filter={isHovered ? 'url(#shadow)' : ''}
                  />
                )}
                {table.shape === 'round' && (
                  <circle
                    cx={size.width / 20}
                    cy={size.height / 20}
                    r={size.width / 20}
                    fill={color}
                    stroke={isHovered || isSelected ? '#333333' : 'transparent'}
                    strokeWidth={isHovered || isSelected ? '0.3' : '0'}
                    opacity={isHovered ? 0.9 : 1}
                    filter={isHovered ? 'url(#shadow)' : ''}
                  />
                )}
                {table.shape === 'rectangle' && (
                  <rect
                    width={size.width / 10}
                    height={size.height / 10}
                    fill={color}
                    stroke={isHovered || isSelected ? '#333333' : 'transparent'}
                    strokeWidth={isHovered || isSelected ? '0.3' : '0'}
                    rx="0.5"
                    opacity={isHovered ? 0.9 : 1}
                    filter={isHovered ? 'url(#shadow)' : ''}
                  />
                )}

                {/* Seats Count - Centered */}
                <text
                  x={size.width / 20}
                  y={size.height / 20}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize="2"
                  fontWeight="bold"
                >
                  {table.seats}
                </text>

                {/* Hover Tooltip */}
                {isHovered && (
                  <g transform={`translate(${size.width / 20}, ${size.height / 10 + 1})`}>
                    <rect
                      x="-4"
                      y="0"
                      width="8"
                      height="3"
                      fill="#333333"
                      rx="0.5"
                    />
                    <text
                      x="0"
                      y="1.5"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="white"
                      fontSize="1.2"
                    >
                      {status === 'available' ? `Table ${table.number} - ${table.location}` :
                       status.charAt(0).toUpperCase() + status.slice(1)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Shadow Filter */}
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="0.5"/>
              <feOffset dx="0" dy="0.2" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.5"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        </svg>
      </div>

      {/* Selected Table Info */}
      {selectedTableId && (
        <div className="mt-4 bg-[#FF6B35] bg-opacity-10 border-2 border-[#FF6B35] rounded-lg p-3">
          {(() => {
            const selectedTable = tables.find(t => t.id === selectedTableId);
            if (!selectedTable) return null;
            return (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#333333] opacity-70">Selected Table</p>
                  <p className="text-sm font-bold text-[#333333]">
                    Table {selectedTable.number} - {selectedTable.seats} Seats ({selectedTable.location})
                  </p>
                </div>
                <button
                  onClick={() => onTableSelect(selectedTable)}
                  className="text-[#FF6B35] hover:text-[#e55a2b] text-sm font-semibold"
                >
                  Change
                </button>
              </div>
            );
          })()}
        </div>
      )}

      {!selectedTableId && selectedGuests && (
        <div className="mt-3 text-center text-[#333333] opacity-70 text-xs">
          <p>Click on a green table to select it</p>
        </div>
      )}
    </div>
  );
}
