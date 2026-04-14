import { render, screen } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

const { getAllMock } = vi.hoisted(() => ({
  getAllMock: vi.fn(),
}));

vi.mock("@/services/api", () => ({
  hiveService: {
    getAll: getAllMock,
  },
}));

import QRPrint from "@/pages/QRPrint";

describe("QRPrint", () => {
  it("shows a load error when hive labels cannot be fetched", async () => {
    getAllMock.mockRejectedValueOnce(
      new axios.AxiosError("load failed", undefined, undefined, undefined, {
        data: { detail: "โหลดข้อมูลป้าย QR ไม่สำเร็จ" },
        status: 500,
        statusText: "Server Error",
        headers: {},
        config: {} as never,
      })
    );

    render(
      <MemoryRouter>
        <QRPrint />
      </MemoryRouter>
    );

    expect(await screen.findByText("โหลดข้อมูลป้าย QR ไม่สำเร็จ")).toBeInTheDocument();
  });

  it("keeps the print action disabled when there are no hives", async () => {
    getAllMock.mockResolvedValueOnce({ data: [] });
    getAllMock.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <QRPrint />
      </MemoryRouter>
    );

    await screen.findByText("ไม่พบข้อมูลรังสำหรับสร้าง QR");
    const buttons = screen.getAllByRole("button");
    expect(buttons[buttons.length - 1]).toBeDisabled();
  });
});
