import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import com.example.tablereservation.entity.Reservation;
import com.example.tablereservation.repository.ReservationRepository;
import com.example.tablereservation.service.ReservationService;
import com.example.tablereservation.service.impl.ReservationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

public class ReservationServiceTests {

    @InjectMocks
    private ReservationServiceImpl reservationService;

    @Mock
    private ReservationRepository reservationRepository;

    private Reservation reservation;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        reservation = new Reservation();
        reservation.setId(1L);
        reservation.setFullName("John Doe");
        reservation.setEmail("john.doe@example.com");
        reservation.setPhone("1234567890");
        reservation.setNumberOfGuests(2);
        reservation.setReservationDate("2023-10-01");
        reservation.setReservationTime("19:00");
    }

    @Test
    public void testCreateReservation() {
        when(reservationRepository.save(any(Reservation.class))).thenReturn(reservation);
        Reservation createdReservation = reservationService.createReservation(reservation);
        assertNotNull(createdReservation);
        assertEquals("John Doe", createdReservation.getFullName());
    }

    @Test
    public void testGetReservationById() {
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
        Optional<Reservation> foundReservation = reservationService.getReservationById(1L);
        assertTrue(foundReservation.isPresent());
        assertEquals("John Doe", foundReservation.get().getFullName());
    }

    @Test
    public void testDeleteReservation() {
        doNothing().when(reservationRepository).deleteById(1L);
        reservationService.deleteReservation(1L);
        verify(reservationRepository, times(1)).deleteById(1L);
    }
}