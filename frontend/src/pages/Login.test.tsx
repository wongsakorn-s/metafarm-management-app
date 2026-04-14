import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { vi } from "vitest";

const { loginMock } = vi.hoisted(() => ({
  loginMock: vi.fn(),
}));

vi.mock("@/services/api", () => ({
  authService: {
    login: loginMock,
  },
}));

import Login from "@/pages/Login";

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="current-path">{location.pathname}</div>;
}

function renderPage(initialState?: { from?: string }) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: "/login", state: initialState }]}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="*"
          element={
            <>
              <LocationProbe />
              <div>redirected</div>
            </>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("Login", () => {
  it("shows an inline error when login fails", async () => {
    loginMock.mockRejectedValueOnce(
      new axios.AxiosError("login failed", undefined, undefined, undefined, {
        data: { detail: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" },
        status: 401,
        statusText: "Unauthorized",
        headers: {},
        config: {} as never,
      })
    );

    renderPage();

    fireEvent.change(screen.getByTestId("login-username"), { target: { value: "admin" } });
    fireEvent.change(screen.getByTestId("login-password"), { target: { value: "wrong-password" } });
    fireEvent.click(screen.getByTestId("login-submit"));

    expect(await screen.findByTestId("login-error")).toHaveTextContent("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
  });

  it("trims username and redirects to requested route after success", async () => {
    loginMock.mockResolvedValueOnce({ data: { access_token: "token" } });

    renderPage({ from: "/hives" });

    fireEvent.change(screen.getByTestId("login-username"), { target: { value: " admin " } });
    fireEvent.change(screen.getByTestId("login-password"), { target: { value: "password" } });
    fireEvent.click(screen.getByTestId("login-submit"));

    await waitFor(() => expect(loginMock).toHaveBeenCalledWith("admin", "password", true));
    expect(await screen.findByTestId("current-path")).toHaveTextContent("/hives");
  });
});
