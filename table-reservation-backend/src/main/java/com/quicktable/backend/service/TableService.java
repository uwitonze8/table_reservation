package com.quicktable.backend.service;

import com.quicktable.backend.dto.table.*;
import com.quicktable.backend.entity.RestaurantTable;
import com.quicktable.backend.entity.TableStatus;
import com.quicktable.backend.exception.BadRequestException;
import com.quicktable.backend.exception.ResourceNotFoundException;
import com.quicktable.backend.repository.RestaurantTableRepository;
import com.quicktable.backend.util.DtoMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class TableService {

    private final RestaurantTableRepository tableRepository;
    private final DtoMapper dtoMapper;

    public List<TableDTO> getAllTables() {
        return tableRepository.findAll().stream()
                .map(dtoMapper::toTableDTO)
                .collect(Collectors.toList());
    }

    public TableDTO getTableById(Long id) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));
        return dtoMapper.toTableDTO(table);
    }

    public TableDTO getTableByNumber(Integer tableNumber) {
        RestaurantTable table = tableRepository.findByTableNumber(tableNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));
        return dtoMapper.toTableDTO(table);
    }

    public List<TableDTO> getAvailableTables(AvailableTablesRequest request) {
        // Assuming 2-hour reservation window
        // We need to find tables that don't have any reservations within 2 hours before or after the requested time
        LocalTime requestTime = request.getTime();
        LocalTime windowStart = requestTime.minusHours(2).isBefore(LocalTime.MIN.plusHours(2))
                ? LocalTime.MIN : requestTime.minusHours(2);
        LocalTime windowEnd = requestTime.plusHours(2).isAfter(LocalTime.MAX.minusHours(2))
                ? LocalTime.MAX : requestTime.plusHours(2);

        List<RestaurantTable> availableTables = tableRepository.findAvailableTables(
                request.getDate(),
                windowStart,
                windowEnd,
                request.getGuests()
        );

        return availableTables.stream()
                .map(dtoMapper::toTableDTO)
                .collect(Collectors.toList());
    }

    public List<TableDTO> getTablesByStatus(TableStatus status) {
        return tableRepository.findByStatus(status).stream()
                .map(dtoMapper::toTableDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TableDTO createTable(CreateTableRequest request) {
        if (tableRepository.existsByTableNumber(request.getTableNumber())) {
            throw new BadRequestException("Table number already exists");
        }

        RestaurantTable table = RestaurantTable.builder()
                .tableNumber(request.getTableNumber())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .shape(request.getShape())
                .status(TableStatus.AVAILABLE)
                .positionX(request.getPositionX())
                .positionY(request.getPositionY())
                .description(request.getDescription())
                .build();

        RestaurantTable savedTable = tableRepository.save(table);
        return dtoMapper.toTableDTO(savedTable);
    }

    @Transactional
    public TableDTO updateTable(Long id, UpdateTableRequest request) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));

        if (request.getTableNumber() != null && !request.getTableNumber().equals(table.getTableNumber())) {
            if (tableRepository.existsByTableNumber(request.getTableNumber())) {
                throw new BadRequestException("Table number already exists");
            }
            table.setTableNumber(request.getTableNumber());
        }

        if (request.getCapacity() != null) {
            table.setCapacity(request.getCapacity());
        }
        if (request.getLocation() != null) {
            table.setLocation(request.getLocation());
        }
        if (request.getShape() != null) {
            table.setShape(request.getShape());
        }
        if (request.getStatus() != null) {
            table.setStatus(request.getStatus());
        }
        if (request.getPositionX() != null) {
            table.setPositionX(request.getPositionX());
        }
        if (request.getPositionY() != null) {
            table.setPositionY(request.getPositionY());
        }
        if (request.getDescription() != null) {
            table.setDescription(request.getDescription());
        }

        RestaurantTable savedTable = tableRepository.save(table);
        return dtoMapper.toTableDTO(savedTable);
    }

    @Transactional
    public TableDTO updateTableStatus(Long id, TableStatus status) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));

        table.setStatus(status);
        RestaurantTable savedTable = tableRepository.save(table);
        return dtoMapper.toTableDTO(savedTable);
    }

    @Transactional
    public void deleteTable(Long id) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));

        if (!table.getReservations().isEmpty()) {
            throw new BadRequestException("Cannot delete table with existing reservations");
        }

        tableRepository.delete(table);
    }

    public Long getTotalTables() {
        return tableRepository.countAllTables();
    }

    public Long getAvailableTablesCount() {
        return tableRepository.countByStatus(TableStatus.AVAILABLE);
    }

    public Long getOccupiedTablesCount() {
        return tableRepository.countByStatus(TableStatus.OCCUPIED);
    }

    public Double getOccupancyRate() {
        long total = getTotalTables();
        if (total == 0) return 0.0;

        long occupied = getOccupiedTablesCount();
        return (double) occupied / total * 100;
    }

    /**
     * Scheduled task that runs every 10 minutes to automatically reset table status
     * from RESERVED or OCCUPIED to AVAILABLE when their reservation time window has ended.
     * This ensures tables don't stay in RESERVED/OCCUPIED state forever.
     */
    @Scheduled(fixedRate = 600000) // Run every 10 minutes (600,000 ms)
    @Transactional
    public void autoResetTableStatus() {
        LocalDate today = LocalDate.now();
        LocalTime currentTime = LocalTime.now();

        // The reservation window is 2 hours
        // A table should be reset if there are no reservations within the current 2-hour window
        // We check for reservations from 2 hours ago to 2 hours from now
        LocalTime windowStart = currentTime.minusHours(2).isBefore(LocalTime.MIN.plusHours(2))
                ? LocalTime.MIN : currentTime.minusHours(2);
        LocalTime windowEnd = currentTime.plusHours(2).isAfter(LocalTime.MAX.minusHours(2))
                ? LocalTime.MAX : currentTime.plusHours(2);

        List<RestaurantTable> tablesToReset = tableRepository.findTablesWithExpiredReservations(
                today, windowStart, windowEnd
        );

        for (RestaurantTable table : tablesToReset) {
            log.info("Auto-resetting table {} from {} to AVAILABLE (no active reservations in current time window)",
                    table.getTableNumber(), table.getStatus());
            table.setStatus(TableStatus.AVAILABLE);
            tableRepository.save(table);
        }

        if (!tablesToReset.isEmpty()) {
            log.info("Auto-reset {} table(s) to AVAILABLE status", tablesToReset.size());
        }
    }
}
