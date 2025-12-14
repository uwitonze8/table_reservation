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
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-12-05T18:11:12+0200",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Oracle Corporation)"
)
@Component
public class DtoMapperImpl implements DtoMapper {

    @Override
    public UserProfileDto toUserProfileDto(User user) {
        if ( user == null ) {
            return null;
        }

        UserProfileDto userProfileDto = new UserProfileDto();

        userProfileDto.setFirstName( user.getFirstName() );
        userProfileDto.setLastName( user.getLastName() );
        userProfileDto.setEmail( user.getEmail() );
        userProfileDto.setPhone( user.getPhone() );
        userProfileDto.setBirthday( user.getBirthday() );
        userProfileDto.setDietaryPreferences( user.getDietaryPreferences() );
        userProfileDto.setSpecialNotes( user.getSpecialNotes() );

        return userProfileDto;
    }

    @Override
    public User toUser(RegisterRequest registerRequest) {
        if ( registerRequest == null ) {
            return null;
        }

        User user = new User();

        user.setFirstName( registerRequest.getFirstName() );
        user.setLastName( registerRequest.getLastName() );
        user.setEmail( registerRequest.getEmail() );
        user.setPhone( registerRequest.getPhone() );
        user.setPassword( registerRequest.getPassword() );

        return user;
    }

    @Override
    public LoginResponse toLoginResponse(User user) {
        if ( user == null ) {
            return null;
        }

        LoginResponse loginResponse = new LoginResponse();

        loginResponse.setFirstName( user.getFirstName() );
        loginResponse.setLastName( user.getLastName() );
        loginResponse.setEmail( user.getEmail() );

        return loginResponse;
    }

    @Override
    public ReservationDto toReservationDto(Reservation reservation) {
        if ( reservation == null ) {
            return null;
        }

        ReservationDto reservationDto = new ReservationDto();

        reservationDto.setId( reservation.getId() );
        reservationDto.setFullName( reservation.getFullName() );
        reservationDto.setEmail( reservation.getEmail() );
        reservationDto.setPhone( reservation.getPhone() );
        reservationDto.setNumberOfGuests( reservation.getNumberOfGuests() );
        reservationDto.setReservationDateTime( reservation.getReservationDateTime() );
        reservationDto.setSpecialRequests( reservation.getSpecialRequests() );

        return reservationDto;
    }

    @Override
    public Reservation toReservation(ReservationCreateDto reservationCreateDto) {
        if ( reservationCreateDto == null ) {
            return null;
        }

        Reservation reservation = new Reservation();

        reservation.setFullName( reservationCreateDto.getFullName() );
        reservation.setEmail( reservationCreateDto.getEmail() );
        reservation.setPhone( reservationCreateDto.getPhone() );
        reservation.setNumberOfGuests( reservationCreateDto.getNumberOfGuests() );
        reservation.setReservationDateTime( reservationCreateDto.getReservationDateTime() );
        reservation.setSpecialRequests( reservationCreateDto.getSpecialRequests() );

        return reservation;
    }

    @Override
    public TableDto toTableDto(RestaurantTable restaurantTable) {
        if ( restaurantTable == null ) {
            return null;
        }

        TableDto tableDto = new TableDto();

        tableDto.setId( restaurantTable.getId() );
        tableDto.setTableNumber( restaurantTable.getTableNumber() );
        tableDto.setCapacity( restaurantTable.getCapacity() );
        tableDto.setLocation( restaurantTable.getLocation() );
        tableDto.setShape( restaurantTable.getShape() );

        return tableDto;
    }

    @Override
    public ContactMessage toContactMessage(ContactMessageDto contactMessageDto) {
        if ( contactMessageDto == null ) {
            return null;
        }

        ContactMessage contactMessage = new ContactMessage();

        contactMessage.setFirstName( contactMessageDto.getFirstName() );
        contactMessage.setLastName( contactMessageDto.getLastName() );
        contactMessage.setEmail( contactMessageDto.getEmail() );
        contactMessage.setMessage( contactMessageDto.getMessage() );

        return contactMessage;
    }

    @Override
    public ContactMessageDto toContactMessageDto(ContactMessage contactMessage) {
        if ( contactMessage == null ) {
            return null;
        }

        ContactMessageDto contactMessageDto = new ContactMessageDto();

        contactMessageDto.setFirstName( contactMessage.getFirstName() );
        contactMessageDto.setLastName( contactMessage.getLastName() );
        contactMessageDto.setEmail( contactMessage.getEmail() );
        contactMessageDto.setMessage( contactMessage.getMessage() );

        return contactMessageDto;
    }
}
