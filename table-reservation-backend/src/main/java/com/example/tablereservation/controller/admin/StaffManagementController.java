package com.example.tablereservation.controller.admin;

import com.example.tablereservation.entity.Staff;
import com.example.tablereservation.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/admin/staff")
public class StaffManagementController {

    private final AdminService adminService;

    @Autowired
    public StaffManagementController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping
    public ResponseEntity<List<Staff>> getAllStaff() {
        List<Staff> staffList = adminService.getAllStaff();
        return ResponseEntity.ok(staffList);
    }

    @PostMapping
    public ResponseEntity<Staff> addStaff(@Valid @RequestBody Staff staff) {
        Staff newStaff = adminService.addStaff(staff);
        return ResponseEntity.status(201).body(newStaff);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateStaff(@PathVariable Long id, @Valid @RequestBody Staff staff) {
        adminService.editStaff(id, staff);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStaff(@PathVariable Long id) {
        adminService.deleteStaff(id);
        return ResponseEntity.noContent().build();
    }
}
