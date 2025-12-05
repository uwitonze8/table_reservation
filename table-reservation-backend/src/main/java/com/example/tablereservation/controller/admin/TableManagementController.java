package com.example.tablereservation.controller.admin;

import com.example.tablereservation.entity.RestaurantTable;
import com.example.tablereservation.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/admin/tables")
public class TableManagementController {

    private final AdminService adminService;

    @Autowired
    public TableManagementController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping
    public ResponseEntity<List<RestaurantTable>> getAllTables() {
        List<RestaurantTable> tables = adminService.getAllTables();
        return ResponseEntity.ok(tables);
    }

    @PostMapping
    public ResponseEntity<Void> addTable(@Valid @RequestBody RestaurantTable table) {
        adminService.addTable(table);
        return ResponseEntity.status(201).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateTable(@PathVariable Long id, @Valid @RequestBody RestaurantTable table) {
        adminService.editTable(id, table);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTable(@PathVariable Long id) {
        adminService.deleteTable(id);
        return ResponseEntity.noContent().build();
    }
}
