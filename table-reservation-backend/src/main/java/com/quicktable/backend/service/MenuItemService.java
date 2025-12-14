package com.quicktable.backend.service;

import com.quicktable.backend.dto.menu.*;
import com.quicktable.backend.entity.MenuItem;
import com.quicktable.backend.entity.MenuItemType;
import com.quicktable.backend.exception.BadRequestException;
import com.quicktable.backend.exception.ResourceNotFoundException;
import com.quicktable.backend.repository.MenuItemRepository;
import com.quicktable.backend.util.DtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final DtoMapper dtoMapper;

    public List<MenuItemDTO> getAllMenuItems() {
        return menuItemRepository.findAllByOrderBySortOrderAscNameAsc().stream()
                .map(dtoMapper::toMenuItemDTO)
                .collect(Collectors.toList());
    }

    public List<MenuItemDTO> getAvailableMenuItems() {
        return menuItemRepository.findByAvailableTrueOrderByTypeAscSortOrderAscNameAsc().stream()
                .map(dtoMapper::toMenuItemDTO)
                .collect(Collectors.toList());
    }

    public List<MenuItemDTO> getMenuItemsByType(MenuItemType type) {
        return menuItemRepository.findByTypeOrderBySortOrderAscNameAsc(type).stream()
                .map(dtoMapper::toMenuItemDTO)
                .collect(Collectors.toList());
    }

    public List<MenuItemDTO> getAvailableMenuItemsByType(MenuItemType type) {
        return menuItemRepository.findByTypeAndAvailableTrueOrderBySortOrderAscNameAsc(type).stream()
                .map(dtoMapper::toMenuItemDTO)
                .collect(Collectors.toList());
    }

    public MenuItemDTO getMenuItemById(Long id) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));
        return dtoMapper.toMenuItemDTO(item);
    }

    public List<String> getCategoriesByType(MenuItemType type) {
        return menuItemRepository.findDistinctCategoriesByType(type);
    }

    public List<String> getAllCategories() {
        return menuItemRepository.findAllDistinctCategories();
    }

    // Get menu items grouped by category for display
    public Map<String, List<MenuItemDTO>> getMenuItemsGroupedByCategory(MenuItemType type) {
        List<MenuItem> items = menuItemRepository.findByTypeAndAvailableTrueOrderBySortOrderAscNameAsc(type);
        return items.stream()
                .map(dtoMapper::toMenuItemDTO)
                .collect(Collectors.groupingBy(MenuItemDTO::getCategory));
    }

    @Transactional
    public MenuItemDTO createMenuItem(CreateMenuItemRequest request) {
        // Check for duplicate
        if (menuItemRepository.existsByTypeAndCategoryAndName(
                request.getType(), request.getCategory(), request.getName())) {
            throw new BadRequestException("A menu item with this name already exists in this category");
        }

        MenuItem item = MenuItem.builder()
                .type(request.getType())
                .category(request.getCategory())
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .available(request.getAvailable() != null ? request.getAvailable() : true)
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .build();

        MenuItem savedItem = menuItemRepository.save(item);
        return dtoMapper.toMenuItemDTO(savedItem);
    }

    @Transactional
    public MenuItemDTO updateMenuItem(Long id, UpdateMenuItemRequest request) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));

        if (request.getType() != null) {
            item.setType(request.getType());
        }
        if (request.getCategory() != null) {
            item.setCategory(request.getCategory());
        }
        if (request.getName() != null) {
            item.setName(request.getName());
        }
        if (request.getDescription() != null) {
            item.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            item.setPrice(request.getPrice());
        }
        if (request.getAvailable() != null) {
            item.setAvailable(request.getAvailable());
        }
        if (request.getSortOrder() != null) {
            item.setSortOrder(request.getSortOrder());
        }

        MenuItem savedItem = menuItemRepository.save(item);
        return dtoMapper.toMenuItemDTO(savedItem);
    }

    @Transactional
    public void deleteMenuItem(Long id) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));
        menuItemRepository.delete(item);
    }

    @Transactional
    public MenuItemDTO toggleAvailability(Long id) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));
        item.setAvailable(!item.getAvailable());
        MenuItem savedItem = menuItemRepository.save(item);
        return dtoMapper.toMenuItemDTO(savedItem);
    }

    @Transactional
    public void deleteAllMenuItems() {
        menuItemRepository.deleteAll();
    }
}
