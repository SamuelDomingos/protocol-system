"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { PaginationService } from "../services/pagination-service";
import { useUrlParams } from "@/src/hooks/useUrlParams";
import {
  PaginationOptions,
  PaginatedResponse,
  PaginationRequestParams,
  UsePaginationReturn,
} from "../types/pagination";

export function usePagination(
  options: PaginationOptions = {}
): UsePaginationReturn {
  const {
    initialPage = PaginationService.DEFAULT_PAGE,
    initialItemsPerPage = PaginationService.DEFAULT_ITEMS_PER_PAGE,
    syncWithUrl = true,
  } = options;

  const { params, setPage: setUrlPage, updateParams } = useUrlParams();

  const [state, setState] = useState(() => {
    if (syncWithUrl) {
      const urlParams = PaginationService.parseFromURL(params);
      return {
        currentPage: urlParams.page,
        itemsPerPage: urlParams.limit,
        totalPages: 1,
        totalItems: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    }

    return {
      currentPage: initialPage,
      itemsPerPage: initialItemsPerPage,
      totalPages: 1,
      totalItems: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  });

  const { startItem, endItem, isEmpty } = useMemo(
    () =>
      PaginationService.calculateDisplayInfo(
        state.currentPage,
        state.itemsPerPage,
        state.totalItems
      ),
    [state.currentPage, state.itemsPerPage, state.totalItems]
  );

  useEffect(() => {
    if (syncWithUrl) {
      const urlParams = PaginationService.parseFromURL(params);
      if (urlParams.page !== state.currentPage) {
        setState((prev) => ({ ...prev, currentPage: urlParams.page }));
      }
      if (urlParams.limit !== state.itemsPerPage) {
        setState((prev) => ({
          ...prev,
          itemsPerPage: urlParams.limit,
          currentPage: 1,
        }));
      }
    }
  }, [params, syncWithUrl]);

  const goToPage = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, state.totalPages));
      if (validPage !== state.currentPage) {
        setState((prev) => ({ ...prev, currentPage: validPage }));

        if (syncWithUrl) {
          setUrlPage(validPage);
        }
      }
    },
    [state.currentPage, state.totalPages, setUrlPage, syncWithUrl]
  );

  const goToNextPage = useCallback(() => {
    if (state.hasNextPage) {
      goToPage(state.currentPage + 1);
    }
  }, [state.hasNextPage, state.currentPage, goToPage]);

  const goToPreviousPage = useCallback(() => {
    if (state.hasPreviousPage) {
      goToPage(state.currentPage - 1);
    }
  }, [state.hasPreviousPage, state.currentPage, goToPage]);

  const setItemsPerPage = useCallback(
    (newItemsPerPage: number) => {
      if (newItemsPerPage !== state.itemsPerPage) {
        setState((prev) => ({
          ...prev,
          itemsPerPage: newItemsPerPage,
          currentPage: 1,
        }));

        if (syncWithUrl) {
          updateParams({
            limit: newItemsPerPage.toString(),
            page: "1",
          });
        }
      }
    },
    [state.itemsPerPage, updateParams, syncWithUrl]
  );

  const getRequestParams = useCallback((): PaginationRequestParams => {
    return {
      page: state.currentPage,
      limit: state.itemsPerPage,
    };
  }, [state.currentPage, state.itemsPerPage]);

  const updateFromResponse = useCallback((response: PaginatedResponse<any>) => {
    const { pagination } = response;

    setState({
      currentPage: pagination.currentPage,
      itemsPerPage: pagination.itemsPerPage,
      totalPages: pagination.totalPages,
      totalItems: pagination.totalItems,
      hasNextPage: pagination.hasNextPage,
      hasPreviousPage: pagination.hasPreviousPage,
    });
  }, []);

  return {
    currentPage: state.currentPage,
    itemsPerPage: state.itemsPerPage,
    totalPages: state.totalPages,
    totalItems: state.totalItems,
    hasNextPage: state.hasNextPage,
    hasPreviousPage: state.hasPreviousPage,

    startItem,
    endItem,
    isEmpty,

    goToPage,
    goToNextPage,
    goToPreviousPage,
    setItemsPerPage,

    getRequestParams,
    updateFromResponse,
  };
}
