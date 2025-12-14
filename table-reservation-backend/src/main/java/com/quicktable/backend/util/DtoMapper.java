package com.quicktable.backend.util;

import com.quicktable.backend.dto.contact.ContactMessageDTO;
import com.quicktable.backend.dto.menu.MenuItemDTO;
import com.quicktable.backend.dto.reservation.ReservationDTO;
import com.quicktable.backend.dto.staff.StaffDTO;
import com.quicktable.backend.dto.table.TableDTO;
import com.quicktable.backend.dto.user.UserDTO;
import com.quicktable.backend.entity.*;
import org.springframework.stereotype.Component;

@Component
public class DtoMapper {

    public UserDTO toUserDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .birthday(user.getBirthday())
                .dietaryPreferences(user.getDietaryPreferences())
                .favoriteTable(user.getFavoriteTable())
                .specialNotes(user.getSpecialNotes())
                .avatar(user.getAvatar())
                .enabled(user.getEnabled())
                .loyaltyPoints(user.getLoyaltyPoints())
                .loyaltyTier(user.getLoyaltyTier())
                .totalReservations(user.getTotalReservations())
                .completedReservations(user.getCompletedReservations())
                .cancelledReservations(user.getCancelledReservations())
                .totalSpent(user.getTotalSpent())
                .lastVisit(user.getLastVisit())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public ReservationDTO toReservationDTO(Reservation reservation) {
        return ReservationDTO.builder()
                .id(reservation.getId())
                .reservationCode(reservation.getReservationCode())
                .userId(reservation.getUser().getId())
                .customerName(reservation.getCustomerName())
                .customerEmail(reservation.getCustomerEmail())
                .customerPhone(reservation.getCustomerPhone())
                .reservationDate(reservation.getReservationDate())
                .reservationTime(reservation.getReservationTime())
                .numberOfGuests(reservation.getNumberOfGuests())
                .specialRequests(reservation.getSpecialRequests())
                .status(reservation.getStatus())
                .loyaltyPointsEarned(reservation.getLoyaltyPointsEarned())
                .tableId(reservation.getTable().getId())
                .tableName(reservation.getTable().getTableName())
                .tableNumber(reservation.getTable().getTableNumber())
                .tableLocation(reservation.getTable().getLocation().name())
                .preOrderData(reservation.getPreOrderData())
                .dietaryNotes(reservation.getDietaryNotes())
                .createdAt(reservation.getCreatedAt())
                .updatedAt(reservation.getUpdatedAt())
                .build();
    }

    public TableDTO toTableDTO(RestaurantTable table) {
        return TableDTO.builder()
                .id(table.getId())
                .tableNumber(table.getTableNumber())
                .capacity(table.getCapacity())
                .location(table.getLocation())
                .shape(table.getShape())
                .status(table.getStatus())
                .positionX(table.getPositionX())
                .positionY(table.getPositionY())
                .description(table.getDescription())
                .tableName(table.getTableName())
                .createdAt(table.getCreatedAt())
                .build();
    }

    public StaffDTO toStaffDTO(Staff staff) {
        return StaffDTO.builder()
                .id(staff.getId())
                .staffId(staff.getStaffId())
                .fullName(staff.getFullName())
                .email(staff.getEmail())
                .phone(staff.getPhone())
                .role(staff.getRole())
                .active(staff.getActive())
                .avatar(staff.getAvatar())
                .createdAt(staff.getCreatedAt())
                .build();
    }

    public ContactMessageDTO toContactMessageDTO(ContactMessage message) {
        return ContactMessageDTO.builder()
                .id(message.getId())
                .firstName(message.getFirstName())
                .lastName(message.getLastName())
                .fullName(message.getFirstName() + " " + message.getLastName())
                .email(message.getEmail())
                .message(message.getMessage())
                .read(message.getRead())
                .replied(message.getReplied())
                .replyMessage(message.getReplyMessage())
                .repliedAt(message.getRepliedAt())
                .createdAt(message.getCreatedAt())
                .build();
    }

    public MenuItemDTO toMenuItemDTO(MenuItem item) {
        return MenuItemDTO.builder()
                .id(item.getId())
                .type(item.getType())
                .category(item.getCategory())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .available(item.getAvailable())
                .sortOrder(item.getSortOrder())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
