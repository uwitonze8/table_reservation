package com.example.tablereservation.mapper;

import com.example.tablereservation.dto.auth.LoginResponse;
import com.example.tablereservation.dto.auth.RegisterRequest;
import com.example.tablereservation.dto.contact.ContactMessageDto;
import com.example.tablereservation.dto.reservation.ReservationCreateDto;
import com.example.tablereservation.dto.reservation.ReservationDto;
import com.example.tablereservation.dto.table.TableDto;
import com.example.tablereservation.dto.user.UserProfileDto;
import com.example.tablereservation.entity.ContactMessage;
import com.example.tablereservation.entity.Reservation;
import com.example.tablereservation.entity.RestaurantTable;
import com.example.tablereservation.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DtoMapper {

    UserProfileDto toUserProfileDto(User user);

    User toUser(RegisterRequest registerRequest);

    LoginResponse toLoginResponse(User user);

    ReservationDto toReservationDto(Reservation reservation);

    Reservation toReservation(ReservationCreateDto reservationCreateDto);

    TableDto toTableDto(RestaurantTable restaurantTable);

    ContactMessage toContactMessage(ContactMessageDto contactMessageDto);

    ContactMessageDto toContactMessageDto(ContactMessage contactMessage);
}