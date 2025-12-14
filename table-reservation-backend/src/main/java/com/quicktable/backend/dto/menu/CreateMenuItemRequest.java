package com.quicktable.backend.dto.menu;

import com.quicktable.backend.entity.MenuItemType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateMenuItemRequest {

    @NotNull(message = "Type is required")
    private MenuItemType type;

    @NotBlank(message = "Category is required")
    @Size(max = 100, message = "Category must be less than 100 characters")
    private String category;

    @NotBlank(message = "Name is required")
    @Size(max = 200, message = "Name must be less than 200 characters")
    private String name;

    @Size(max = 500, message = "Description must be less than 500 characters")
    private String description;

    private BigDecimal price;

    private Boolean available = true;

    private Integer sortOrder = 0;
}
