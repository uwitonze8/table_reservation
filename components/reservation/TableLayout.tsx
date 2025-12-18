'use client';

import { useState, useEffect, useRef } from 'react';
import { tableApi, Table as ApiTable } from '@/lib/api';

export interface Table {
  id: string;
  number: number;
  seats: number;
  position: { x: number; y: number };
  shape: 'square' | 'round' | 'rectangle' | 'oval';
  status: 'available' | 'reserved' | 'occupied' | 'maintenance';
  location: string;
}

interface TableLayoutProps {
  selectedDate?: string;
  selectedTime?: string;
  selectedGuests?: number;
  onTableSelect: (table: Table) => void;
  selectedTableId?: string;
}

// Room/Area definitions with positions on the floor plan (matching admin page)
const ROOM_AREAS = [
  { id: 'WINDOW', name: 'Window Area', x: 0, y: 0, width: 300, height: 250, color: '#E8F5E9' },
  { id: 'CENTER', name: 'Center Area', x: 320, y: 0, width: 300, height: 250, color: '#FFF3E0' },
  { id: 'BAR', name: 'Bar Area', x: 640, y: 0, width: 200, height: 250, color: '#E3F2FD' },
  { id: 'PATIO', name: 'Patio', x: 0, y: 270, width: 420, height: 200, color: '#F3E5F5' },
  { id: 'PRIVATE', name: 'Private Room', x: 440, y: 270, width: 400, height: 200, color: '#FFEBEE' },
];

// Get default position for a table based on its location
const getDefaultPosition = (apiTable: ApiTable): { x: number; y: number } => {
  const area = ROOM_AREAS.find(a => a.id === apiTable.location) || ROOM_AREAS[1];
  // Calculate position based on table number within the area
  const tableIndex = apiTable.tableNumber % 10;
  const cols = Math.floor(area.width / 80);
  const row = Math.floor(tableIndex / cols);
  const col = tableIndex % cols;

  return {
    x: area.x + 30 + col * 80,
    y: area.y + 50 + row * 70
  };
};

// Map API table to component table format
const mapApiTable = (apiTable: ApiTable): Table => {
  return {
    id: String(apiTable.id),
    number: apiTable.tableNumber,
    seats: apiTable.capacity,
    position: apiTable.positionX !== undefined && apiTable.positionY !== undefined && apiTable.positionX !== null && apiTable.positionY !== null
      ? { x: apiTable.positionX, y: apiTable.positionY }
      : getDefaultPosition(apiTable),
    shape: (apiTable.shape?.toLowerCase() || 'square') as 'square' | 'round' | 'rectangle' | 'oval',
    status: (apiTable.status?.toLowerCase() || 'available') as 'available' | 'reserved' | 'occupied' | 'maintenance',
    location: apiTable.location || 'CENTER',
  };
};

// Convert 12-hour time to 24-hour format for API
const convertTo24Hour = (time12h: string): string => {
  if (!time12h) return '';
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');

  if (modifier === 'PM' && hours !== '12') {
    hours = String(parseInt(hours, 10) + 12);
  }
  if (modifier === 'AM' && hours === '12') {
    hours = '00';
  }

  return `${hours.padStart(2, '0')}:${minutes}:00`;
};

export default function TableLayout({ selectedDate, selectedTime, selectedGuests, onTableSelect, selectedTableId }: TableLayoutProps) {
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);
  const [allTables, setAllTables] = useState<Table[]>([]);
  const [availableTableIds, setAvailableTableIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAlternatives, setShowAlternatives] = useState(false);
  const floorPlanRef = useRef<HTMLDivElement>(null);

  // Fetch all tables first
  useEffect(() => {
    const fetchAllTables = async () => {
      try {
        setLoading(true);
        const response = await tableApi.getAll();
        if (response.success && response.data) {
          const mappedTables = response.data.map(mapApiTable);
          setAllTables(mappedTables);
        } else {
          setError('Failed to load tables');
        }
      } catch (err) {
        setError('Failed to load tables');
      } finally {
        setLoading(false);
      }
    };

    fetchAllTables();
  }, []);

  // Reset showAlternatives when guest count changes
  useEffect(() => {
    setShowAlternatives(false);
  }, [selectedGuests]);

  // Fetch available tables when date, time, and guests are selected
  useEffect(() => {
    const fetchAvailableTables = async () => {
      if (!selectedDate || !selectedTime || !selectedGuests) {
        // If criteria not selected, all non-maintenance tables are potentially available
        setAvailableTableIds(new Set(allTables.filter(t => t.status !== 'maintenance').map(t => t.id)));
        return;
      }

      try {
        const time24 = convertTo24Hour(selectedTime);
        const response = await tableApi.getAvailable(selectedDate, time24, selectedGuests);

        if (response.success && response.data) {
          const availableIds = new Set(response.data.map(t => String(t.id)));
          setAvailableTableIds(availableIds);
        }
      } catch (err) {
        console.error('Failed to fetch available tables:', err);
        // On error, show all non-maintenance tables as available
        setAvailableTableIds(new Set(allTables.filter(t => t.status !== 'maintenance').map(t => t.id)));
      }
    };

    if (allTables.length > 0) {
      fetchAvailableTables();
    }
  }, [selectedDate, selectedTime, selectedGuests, allTables]);

  // Get table status considering availability
  const getTableStatus = (table: Table): 'available' | 'selected' => {
    if (selectedTableId === table.id) return 'selected';
    return 'available';
  };

  // Get table color based on status
  const getTableColor = (table: Table): string => {
    const status = getTableStatus(table);
    if (status === 'selected') return '#FF6B35'; // Selected - Orange
    return '#4ade80'; // Available - Green
  };

  // Get table size based on shape
  const getTableSize = (table: Table): { width: number; height: number } => {
    switch (table.shape) {
      case 'round':
        return { width: 50, height: 50 };
      case 'rectangle':
        return { width: 70, height: 45 };
      case 'oval':
        return { width: 65, height: 45 };
      default: // SQUARE
        return { width: 50, height: 50 };
    }
  };

  const handleTableClick = (table: Table) => {
    onTableSelect(table);
  };

  // Check if there are exact match tables available
  const getExactMatchTables = (): Table[] => {
    const filteredTables = allTables.filter(table => availableTableIds.has(table.id));
    if (!selectedGuests) return filteredTables;
    return filteredTables.filter(table => table.seats === selectedGuests);
  };

  // Get alternative tables (slightly larger) when no exact match
  const getAlternativeTables = (): Table[] => {
    const filteredTables = allTables.filter(table => availableTableIds.has(table.id));
    if (!selectedGuests) return [];
    // Show tables with +1 or +2 seats as alternatives
    return filteredTables.filter(table =>
      table.seats > selectedGuests && table.seats <= selectedGuests + 2
    );
  };

  // Filter to show tables based on guest count and user choice
  const getAvailableTables = (): Table[] => {
    // Only show tables that are in the availableTableIds set (returned by API)
    const filteredTables = allTables.filter(table => availableTableIds.has(table.id));

    // If guest count is selected, filter based on matching
    if (selectedGuests) {
      // Get exact match tables
      const exactMatchTables = getExactMatchTables();

      // If we have exact matches, return those
      if (exactMatchTables.length > 0) {
        return exactMatchTables;
      }

      // If user chose to see alternatives, show them
      if (showAlternatives) {
        return getAlternativeTables();
      }

      // No exact matches and user hasn't chosen alternatives
      return [];
    }

    return filteredTables;
  };

  const exactMatchCount = getExactMatchTables().length;
  const alternativeCount = getAlternativeTables().length;

  const availableTables = getAvailableTables();
  const availableCount = availableTables.length;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-4">
        <h3 className="text-lg font-bold text-[#333333] mb-4">Select Your Table</h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin w-10 h-10 border-4 border-[#FF6B35] border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-sm text-[#333333] opacity-70">Loading floor plan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-4">
        <h3 className="text-lg font-bold text-[#333333] mb-4">Select Your Table</h3>
        <div className="text-center text-red-500 py-8">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-[#333333]">Select Your Table</h3>
          {selectedGuests && selectedDate && selectedTime && (
            <p className="text-xs text-[#333333] opacity-70">
              {availableCount} table{availableCount !== 1 ? 's' : ''} available for {selectedGuests} guest{selectedGuests !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="text-right">
          {selectedDate && (
            <p className="text-xs text-[#FF6B35] font-semibold">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          )}
          {selectedTime && (
            <p className="text-xs text-[#333333]">{selectedTime}</p>
          )}
        </div>
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
      </div>

      {/* Floor Plan Canvas */}
      <div
        ref={floorPlanRef}
        className="relative bg-gray-100 rounded-lg overflow-hidden select-none"
        style={{ width: '100%', height: '500px' }}
      >
        {/* Room Areas */}
        {ROOM_AREAS.map((area) => (
          <div
            key={area.id}
            className="absolute border-2 border-dashed border-gray-400 rounded-lg"
            style={{
              left: area.x,
              top: area.y,
              width: area.width,
              height: area.height,
              backgroundColor: area.color,
            }}
          >
            <div className="absolute top-2 left-2 text-xs font-semibold text-gray-600 bg-white/70 px-2 py-0.5 rounded">
              {area.name}
            </div>
          </div>
        ))}

        {/* Tables - Only show available tables */}
        {availableTables.map((table) => {
          const size = getTableSize(table);
          const status = getTableStatus(table);
          const isHovered = hoveredTable === table.id;
          const isSelected = selectedTableId === table.id;

          return (
            <div
              key={table.id}
              className={`absolute flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
                isHovered ? 'z-50 scale-110' : 'z-10'
              } ${
                isSelected ? 'ring-4 ring-[#FF6B35] ring-opacity-50' : ''
              }`}
              style={{
                left: table.position.x,
                top: table.position.y,
                width: size.width,
                height: size.height,
                borderRadius: table.shape === 'round' || table.shape === 'oval' ? '50%' : '8px',
                backgroundColor: getTableColor(table),
                boxShadow: isHovered ? '0 8px 25px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
              }}
              onClick={() => handleTableClick(table)}
              onMouseEnter={() => setHoveredTable(table.id)}
              onMouseLeave={() => setHoveredTable(null)}
            >
              <span className="text-white font-bold text-xs">#{table.number}</span>
              <span className="text-white text-[10px] opacity-90">{table.seats}p</span>

              {/* Tooltip on hover */}
              {isHovered && (
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-[#333333] text-white px-3 py-1.5 rounded-lg text-xs whitespace-nowrap shadow-lg z-50">
                  <p className="font-semibold">Table {table.number}</p>
                  <p>{table.seats} seats - {table.location}</p>
                  {status === 'available' && (
                    <p className="text-green-300">Click to select</p>
                  )}
                  {status === 'selected' && (
                    <p className="text-[#FF6B35]">Selected</p>
                  )}
                  {/* Arrow */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                    <div className="border-8 border-transparent border-t-[#333333]"></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Entrance marker */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 px-2 py-1 rounded-lg shadow">
          <svg className="w-4 h-4 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-xs font-semibold text-[#333333]">Entrance</span>
        </div>

        {/* Kitchen marker */}
        <div className="absolute bottom-3 right-3 bg-gray-300 px-3 py-1 rounded-lg text-xs font-semibold text-[#333333] shadow">
          Kitchen
        </div>
      </div>

      {/* Selected Table Info */}
      {selectedTableId && (
        <div className="mt-4 bg-[#FF6B35] bg-opacity-10 border-2 border-[#FF6B35] rounded-lg p-3">
          {(() => {
            const selectedTable = availableTables.find(t => t.id === selectedTableId);
            if (!selectedTable) return null;
            return (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FF6B35] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">#{selectedTable.number}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#333333]">
                      Table {selectedTable.number} Selected
                    </p>
                    <p className="text-xs text-[#333333] opacity-70">
                      {selectedTable.seats} seats - {selectedTable.location}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onTableSelect({ ...selectedTable, id: '' })}
                  className="text-[#FF6B35] hover:text-[#e55a2b] text-sm font-semibold cursor-pointer"
                >
                  Change
                </button>
              </div>
            );
          })()}
        </div>
      )}

      {!selectedTableId && availableCount > 0 && (
        <div className="mt-3 text-center text-[#333333] opacity-70 text-xs">
          <p>Click on a green table to select it</p>
        </div>
      )}

      {/* No exact match tables - show option to view alternatives */}
      {availableCount === 0 && selectedGuests && selectedDate && selectedTime && !showAlternatives && alternativeCount > 0 && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-yellow-800 font-semibold">No {selectedGuests}-seat tables available</p>
          </div>
          <p className="text-xs text-yellow-700 mb-3">
            There are no tables with exactly {selectedGuests} seat{selectedGuests !== 1 ? 's' : ''} available at {selectedTime} on this date.
          </p>
          <div className="bg-white/50 rounded-lg p-3 mb-3">
            <p className="text-xs text-yellow-800 font-medium mb-2">
              However, we have {alternativeCount} alternative table{alternativeCount !== 1 ? 's' : ''} with slightly more seats:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {getAlternativeTables().slice(0, 5).map(table => (
                <span key={table.id} className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Table #{table.number} ({table.seats} seats)
                </span>
              ))}
              {alternativeCount > 5 && (
                <span className="text-xs text-yellow-700">+{alternativeCount - 5} more</span>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowAlternatives(true)}
            className="px-4 py-2 bg-[#FF6B35] text-white text-sm font-semibold rounded-lg hover:bg-[#e55a2b] transition-colors cursor-pointer"
          >
            Show Alternative Tables
          </button>
          <p className="text-[10px] text-yellow-600 mt-2">
            Or try a different time or date for {selectedGuests}-seat tables
          </p>
        </div>
      )}

      {/* Showing alternatives indicator */}
      {showAlternatives && availableCount > 0 && selectedGuests && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-blue-800">
                Showing <span className="font-semibold">{availableCount} alternative table{availableCount !== 1 ? 's' : ''}</span> (larger than {selectedGuests} seats)
              </p>
            </div>
            <button
              onClick={() => setShowAlternatives(false)}
              className="text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer"
            >
              Hide alternatives
            </button>
          </div>
        </div>
      )}

      {/* No tables at all (including alternatives) */}
      {availableCount === 0 && selectedGuests && selectedDate && selectedTime && (showAlternatives || alternativeCount === 0) && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <p className="text-sm text-red-800 font-semibold">No tables available</p>
          <p className="text-xs text-red-700 mt-1">
            No suitable tables for {selectedGuests} guest{selectedGuests !== 1 ? 's' : ''} are available at {selectedTime} on this date.
            Please try a different time or date.
          </p>
        </div>
      )}
    </div>
  );
}
