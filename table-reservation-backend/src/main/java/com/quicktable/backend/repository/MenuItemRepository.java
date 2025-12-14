package com.quicktable.backend.repository;

import com.quicktable.backend.entity.MenuItem;
import com.quicktable.backend.entity.MenuItemType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    List<MenuItem> findByTypeOrderBySortOrderAscNameAsc(MenuItemType type);

    List<MenuItem> findByTypeAndAvailableTrueOrderBySortOrderAscNameAsc(MenuItemType type);

    List<MenuItem> findByCategoryOrderBySortOrderAscNameAsc(String category);

    List<MenuItem> findByTypeAndCategoryOrderBySortOrderAscNameAsc(MenuItemType type, String category);

    List<MenuItem> findAllByOrderBySortOrderAscNameAsc();

    List<MenuItem> findByAvailableTrueOrderByTypeAscSortOrderAscNameAsc();

    @Query("SELECT DISTINCT m.category FROM MenuItem m WHERE m.type = :type ORDER BY m.category")
    List<String> findDistinctCategoriesByType(MenuItemType type);

    @Query("SELECT DISTINCT m.category FROM MenuItem m ORDER BY m.category")
    List<String> findAllDistinctCategories();

    boolean existsByTypeAndCategoryAndName(MenuItemType type, String category, String name);
}
