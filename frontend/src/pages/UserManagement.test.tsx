import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

const { getAllMock, createMock, deleteMock } = vi.hoisted(() => ({
  getAllMock: vi.fn(),
  createMock: vi.fn(),
  deleteMock: vi.fn(),
}));

vi.mock("@/services/api", () => ({
  userService: {
    getAll: getAllMock,
    create: createMock,
    delete: deleteMock,
  },
}));

import UserManagement from "@/pages/UserManagement";

describe("UserManagement", () => {
  beforeEach(() => {
    deleteMock.mockResolvedValue({});
  });

  it("shows a load error when fetching users fails", async () => {
    getAllMock.mockRejectedValueOnce(new Error("load failed"));

    render(
      <MemoryRouter>
        <UserManagement />
      </MemoryRouter>
    );

    expect(await screen.findByText("โหลดข้อมูลผู้ใช้ไม่สำเร็จ")).toBeInTheDocument();
  });

  it("shows an inline form error when creating a user fails", async () => {
    getAllMock.mockResolvedValueOnce({ data: [] });
    createMock.mockRejectedValueOnce(new Error("create failed"));

    render(
      <MemoryRouter>
        <UserManagement />
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByText("เพิ่มสมาชิกใหม่"));
    fireEvent.change(screen.getByPlaceholderText("staff_01"), { target: { value: "staff01" } });
    fireEvent.change(screen.getByPlaceholderText("อย่างน้อย 8 ตัวอักษร"), { target: { value: "password123" } });
    fireEvent.click(screen.getByText("สร้างบัญชี"));

    await waitFor(() => expect(screen.getByText("สร้างผู้ใช้งานไม่สำเร็จ")).toBeInTheDocument());
  });
});
