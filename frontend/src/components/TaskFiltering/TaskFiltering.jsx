import React from 'react';
import { useTaskFiltering } from '../../hooks/useTaskFiltering';
import './TaskFiltering.css';

const TaskFiltering = ({ onFilterChange, initialFilters }) => {
  const {
    STATUS,
    filters,
    availableTags,
    handleFilterChange,
    handleResetFilters
  } = useTaskFiltering(onFilterChange, initialFilters);

  return (
    <div className="task-filtering" data-cy="task-filtering">
      <h3>Filter Tasks</h3>
      
      <div className="filters-container">
        {/* Search input */}
        <div className="filter-group">
          <label htmlFor="search-input">Search:</label>
          <input
            id="search-input"
            type="text"
            name="searchTerm"
            value={filters.searchTerm}
            onChange={handleFilterChange}
            placeholder="Search in title or description"
            data-cy="search-input"
          />
        </div>
        
        {/* Priority filter */}
        <div className="filter-group">
          <label htmlFor="priority-filter">Priority:</label>
          <select
            id="priority-filter"
            name="priority"
            value={filters.priority}
            onChange={handleFilterChange}
            data-cy="priority-filter"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        
        {/* Status filter */}
        <div className="filter-group">
          <label htmlFor="status-filter">Status:</label>
          <select
            id="status-filter"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            data-cy="status-filter"
          >
            <option value="all">All Statuses</option>
            <option value={STATUS.TODO}>To Do</option>
            <option value={STATUS.IN_PROGRESS}>In Progress</option>
            <option value={STATUS.REVIEW}>Review</option>
            <option value={STATUS.DONE}>Done</option>
          </select>
        </div>
        
        {/* Tag filter */}
        <div className="filter-group">
          <label htmlFor="tag-filter">Tag:</label>
          <select
            id="tag-filter"
            name="tag"
            value={filters.tag}
            onChange={handleFilterChange}
            data-cy="tag-filter"
          >
            <option value="all">All Tags</option>
            {availableTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
        
        {/* Due date range */}
        <div className="filter-group date-range">
          <label>Due Date Range:</label>
          <div className="date-inputs">
            <input
              type="date"
              name="dueDateFrom"
              value={filters.dueDateFrom}
              onChange={handleFilterChange}
              placeholder="From"
              data-cy="due-date-from"
            />
            <span>to</span>
            <input
              type="date"
              name="dueDateTo"
              value={filters.dueDateTo}
              onChange={handleFilterChange}
              placeholder="To"
              data-cy="due-date-to"
            />
          </div>
        </div>
        
        {/* Reset filters button */}
        <button
          className="reset-button"
          onClick={handleResetFilters}
          data-cy="reset-filters"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default TaskFiltering;