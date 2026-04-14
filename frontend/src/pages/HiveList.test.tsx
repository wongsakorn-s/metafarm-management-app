import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

const { getAllMock, createMock, deleteMock, getUserRoleMock } = vi.hoisted(() => ({
  getAllMock: vi.fn(),
  createMock: vi.fn(),
  deleteMock: vi.fn(),
  getUserRoleMock: vi.fn(),
}));

vi.mock("@/services/api", () => ({
  hiveService: {
    getAll: getAllMock,
    create: createMock,
    delete: deleteMock,
  },
  authStorage: {
    getUserRole: getUserRoleMock,
  },
}));

import HiveList from "@/pages/HiveList";

describe("HiveList", () => {
  beforeEach(() => {
    getUserRoleMock.mockReturnValue("admin");
    deleteMock.mockResolvedValue({});
  });

  it("shows a load error when fetching hives fails", async () => {
    getAllMock.mockRejectedValueOnce(new axios.AxiosError("failed", undefined, undefined, undefined, {
      data: { detail: "โหลดข้อมูลรังไม่สำเร็จจาก API" },
      status: 500,
      statusText: "Server Error",
      headers: {},
      config: {} as never,
    }));

    render(
      <MemoryRouter>
        <HiveList />
      </MemoryRouter>
    );

    expect(await screen.findByText("โหลดข้อมูลรังไม่สำเร็จจาก API")).toBeInTheDocument();
  });

  it("shows an inline form error when create hive fails", async () => {
    getAllMock.mockResolvedValueOnce({ data: [] });
    createMock.mockRejectedValueOnce(new Error("create failed"));

    render(
      <MemoryRouter>
        <HiveList />
      </MemoryRouter>
    );

    await screen.findByText("ไม่พบรังที่ตรงกับคำค้นหา");
    fireEvent.click(screen.getByTestId("open-add-hive-dialog"));
    fireEvent.change(screen.getByTestId("add-hive-id"), { target: { value: "HIVE-001" } });
    fireEvent.click(screen.getByTestId("submit-add-hive"));

    await waitFor(() => expect(screen.getByText("บันทึกรังไม่สำเร็จ")).toBeInTheDocument());
  });
});
