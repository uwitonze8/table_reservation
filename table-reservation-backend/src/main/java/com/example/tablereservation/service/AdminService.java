package com.example.tablereservation.service;

import com.example.tablereservation.entity.Reservation;
import com.example.tablereservation.entity.RestaurantTable;
import com.example.tablereservation.entity.Staff;

import java.util.List;

public interface AdminService {

    List<Reservation> getAllReservations();

    void addReservation(Reservation reservation);

    void editReservation(Long reservationId, Reservation reservation);

    void deleteReservation(Long reservationId);

    List<RestaurantTable> getAllTables();

    void addTable(RestaurantTable table);

    void editTable(Long tableId, RestaurantTable table);

    void deleteTable(Long tableId);

    List<Staff> getAllStaff();

    Staff addStaff(Staff staff);

    void editStaff(Long staffId, Staff staff);

    void deleteStaff(Long staffId);
}
