package com.quicktable.backend.controller;

import com.quicktable.backend.dto.common.ApiResponse;
import com.quicktable.backend.dto.table.*;
import com.quicktable.backend.service.TableService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
@Tag(name = "Tables", description = "Table management endpoints")
public class TableController {

    private final TableService tableService;

    @GetMapping
    @Operation(summary = "Get all tables")
    public ResponseEntity<ApiResponse<List<TableDTO>>> getAllTables() {
        List<TableDTO> tables = tableService.getAllTables();
        return ResponseEntity.ok(ApiResponse.success(tables));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get table by ID")
    public ResponseEntity<ApiResponse<TableDTO>> getTableById(@PathVariable Long id) {
        TableDTO table = tableService.getTableById(id);
        return ResponseEntity.ok(ApiResponse.success(table));
    }

    @PostMapping("/available")
    @Operation(summary = "Get available tables for date/time/guests")
    public ResponseEntity<ApiResponse<List<TableDTO>>> getAvailableTables(
            @Valid @RequestBody AvailableTablesRequest request) {
        List<TableDTO> tables = tableService.getAvailableTables(request);
        return ResponseEntity.ok(ApiResponse.success(tables));
    }
}
