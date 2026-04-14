import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";

const {
  getByIdMock,
  getByHiveMock,
  createHarvestMock,
  createInspectionMock,
  getUserRoleMock,
} = vi.hoisted(() => ({
  getByIdMock: vi.fn(),
  getByHiveMock: vi.fn(),
  createHarvestMock: vi.fn(),
  createInspectionMock: vi.fn(),
  getUserRoleMock: vi.fn(),
}));

vi.mock("@/services/api", () => ({
  BASE_URL: "http://127.0.0.1:8000",
  hiveService: {
    getById: getByIdMock,
  },
  inspectionService: {
    getByHive: getByHiveMock,
    create: createInspectionMock,
  },
  harvestService: {
    create: createHarvestMock,
  },
  authStorage: {
    getUserRole: getUserRoleMock,
  },
}));

import HiveDetail from "@/pages/HiveDetail";

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/hives/HIVE-001"]}>
      <Routes>
        <Route path="/hives/:hive_id" element={<HiveDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("HiveDetail", () => {
  beforeEach(() => {
    getUserRoleMock.mockReturnValue("admin");
  });

  it("shows a page error when hive details fail to load", async () => {
    getByIdMock.mockRejectedValueOnce(new Error("failed"));

    renderPage();

    expect(await screen.findByText("โหลดข้อมูลรังไม่สำเร็จ")).toBeInTheDocument();
  });

  it("shows an action error when saving harvest fails", async () => {
    getByIdMock.mockResolvedValueOnce({
      data: {
        id: 1,
        hive_id: "HIVE-001",
        name: "Test Hive",
        status: "Normal",
        harvests: [],
      },
    });
    getByHiveMock.mockResolvedValueOnce({ data: [] });
    createHarvestMock.mockRejectedValueOnce(new Error("save failed"));

    renderPage();

    await screen.findByText("Test Hive");
    fireEvent.click(screen.getByTestId("open-harvest-dialog"));
    fireEvent.click(screen.getByTestId("submit-harvest"));

    await waitFor(() => expect(screen.getByText("บันทึกผลผลิตไม่สำเร็จ")).toBeInTheDocument());
  });
});
