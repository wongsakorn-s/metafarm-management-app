import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

const { getStatsMock, getCurrentMock } = vi.hoisted(() => ({
  getStatsMock: vi.fn(),
  getCurrentMock: vi.fn(),
}));

vi.mock("@/services/api", () => ({
  dashboardService: {
    getStats: getStatsMock,
  },
  weatherService: {
    getCurrent: getCurrentMock,
  },
}));

import Dashboard from "@/pages/Dashboard";

describe("Dashboard", () => {
  it("shows a page-level error when stats loading fails", async () => {
    getStatsMock.mockRejectedValueOnce(new Error("boom"));
    getCurrentMock.mockResolvedValueOnce({ data: null });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(await screen.findByText("โหลดสรุปข้อมูลไม่สำเร็จ")).toBeInTheDocument();
  });

  it("shows a weather error banner while keeping stats visible", async () => {
    getStatsMock.mockResolvedValueOnce({
      data: {
        total_hives: 4,
        total_honey_ml: 120,
        status_summary: { Strong: 2, Normal: 2 },
        recent_harvests: [],
      },
    });
    getCurrentMock.mockRejectedValueOnce(new axios.AxiosError("weather failed"));

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText("รังทั้งหมด")).toBeInTheDocument());
    expect(screen.getByText("โหลดข้อมูลอากาศไม่สำเร็จ")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });
});
