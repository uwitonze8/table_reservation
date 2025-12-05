package com.example.tablereservation.service.impl;

import com.example.tablereservation.dto.table.TableDto;
import com.example.tablereservation.dto.user.UserProfileDto;
import com.example.tablereservation.entity.Reservation;
import com.example.tablereservation.entity.RestaurantTable;
import com.example.tablereservation.entity.Staff;
import com.example.tablereservation.exception.BadRequestException;
import com.example.tablereservation.exception.ResourceNotFoundException;
import com.example.tablereservation.repository.ReservationRepository;
import com.example.tablereservation.repository.TableRepository;
import com.example.tablereservation.repository.StaffRepository;
import com.example.tablereservation.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminServiceImpl implements AdminService {

    private final ReservationRepository reservationRepository;
    private final TableRepository tableRepository;
    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AdminServiceImpl(ReservationRepository reservationRepository,
                            TableRepository tableRepository,
                            StaffRepository staffRepository,
                            PasswordEncoder passwordEncoder) {
        this.reservationRepository = reservationRepository;
        this.tableRepository = tableRepository;
        this.staffRepository = staffRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    @Override
    public void addReservation(Reservation reservation) {
        reservationRepository.save(reservation);
    }

    @Override
    public void editReservation(Long id, Reservation reservationDetails) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id " + id));
        reservation.setReservationDateTime(reservationDetails.getReservationDateTime());
        reservation.setNumberOfGuests(reservationDetails.getNumberOfGuests());
        reservation.setSpecialRequests(reservationDetails.getSpecialRequests());
        reservationRepository.save(reservation);
    }

    @Override
    public void deleteReservation(Long id) {
        reservationRepository.deleteById(id);
    }

    @Override
    public List<RestaurantTable> getAllTables() {
        return tableRepository.findAll();
    }

    @Override
    public void addTable(RestaurantTable table) {
        tableRepository.save(table);
    }

    @Override
    public void editTable(Long id, RestaurantTable tableDetails) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found with id " + id));
        table.setCapacity(tableDetails.getCapacity());
        table.setLocation(tableDetails.getLocation());
        table.setShape(tableDetails.getShape());
        tableRepository.save(table);
    }

    @Override
    public void deleteTable(Long id) {
        tableRepository.deleteById(id);
    }

    @Override
    public List<Staff> getAllStaff() {
        return staffRepository.findAll();
    }

    @Override
    public Staff addStaff(Staff staff) {
        // Check for duplicate email
        if (staffRepository.existsByEmail(staff.getEmail())) {
            throw new BadRequestException("A staff member with this email already exists.");
        }

        // Check for duplicate phone number
        if (staff.getPhone() != null && !staff.getPhone().isEmpty() && staffRepository.existsByPhone(staff.getPhone())) {
            throw new BadRequestException("A staff member with this phone number already exists.");
        }

        // Hash the password before saving
        staff.setPassword(passwordEncoder.encode(staff.getPassword()));
        return staffRepository.save(staff);
    }

    @Override
    public void editStaff(Long id, Staff staffDetails) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id " + id));
        staff.setFullName(staffDetails.getFullName());
        staff.setEmail(staffDetails.getEmail());
        staff.setPhone(staffDetails.getPhone());
        staff.setRole(staffDetails.getRole());
        staffRepository.save(staff);
    }

    @Override
    public void deleteStaff(Long id) {
        staffRepository.deleteById(id);
    }
}