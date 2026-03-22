import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { Provider } from "jotai";
import { createStore } from "jotai";
import { settingsAtom } from "@/store";
import { SupportView } from "../SupportView";

const mockProduct = {
  productIdentifier: "com.tomatomien.tip",
  localizedTitle: "Coffee",
  localizedDescription: "Buy a coffee",
  formattedPrice: "₩1,100",
  price: 1100,
};

function renderWithStore(ui: React.ReactElement, tipCount = 0) {
  const store = createStore();
  store.set(settingsAtom, { timeFormat: "24h", enabledPlugins: [], tipCount });
  return { store, ...render(<Provider store={store}>{ui}</Provider>) };
}

describe("SupportView", () => {
  const onBack = vi.fn();

  afterEach(() => {
    vi.restoreAllMocks();
    delete (window as unknown as Record<string, unknown>).electronAPI;
  });

  it("renders TossSupportContent when not MAS", () => {
    renderWithStore(<SupportView onBack={onBack} />);
    expect(screen.getByText(/toss qr/i)).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /toss support qr code/i }),
    ).toBeInTheDocument();
  });

  it("renders IAPSupportContent when MAS", async () => {
    (window as unknown as Record<string, unknown>).electronAPI = {
      isMAS: true,
      iapCanMakePayments: vi.fn().mockResolvedValue(true),
      iapGetProducts: vi.fn().mockResolvedValue([]),
    };
    renderWithStore(<SupportView onBack={onBack} />);
    expect(
      await screen.findByText("Unable to load product information."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: /toss support qr code/i }),
    ).not.toBeInTheDocument();
  });

  it("shows tip count when tipCount > 0 in MAS mode", async () => {
    (window as unknown as Record<string, unknown>).electronAPI = {
      isMAS: true,
      iapCanMakePayments: vi.fn().mockResolvedValue(true),
      iapGetProducts: vi.fn().mockResolvedValue([mockProduct]),
    };
    renderWithStore(<SupportView onBack={onBack} />, 5);
    expect(
      await screen.findByText(/You have sent 5 coffees so far\./),
    ).toBeInTheDocument();
  });

  it("shows cannot pay message when canMakePayments is false", async () => {
    (window as unknown as Record<string, unknown>).electronAPI = {
      isMAS: true,
      iapCanMakePayments: vi.fn().mockResolvedValue(false),
      iapGetProducts: vi.fn(),
    };
    renderWithStore(<SupportView onBack={onBack} />);
    expect(
      await screen.findByText(/Purchases are not available on this device\./),
    ).toBeInTheDocument();
  });

  it("shows thanks message and increments tipCount on successful purchase", async () => {
    (window as unknown as Record<string, unknown>).electronAPI = {
      isMAS: true,
      iapCanMakePayments: vi.fn().mockResolvedValue(true),
      iapGetProducts: vi.fn().mockResolvedValue([mockProduct]),
      iapPurchase: vi.fn().mockResolvedValue({ success: true }),
    };
    const { store } = renderWithStore(<SupportView onBack={onBack} />, 3);

    const button = await screen.findByRole("button", { name: "Send a tip" });
    fireEvent.click(button);

    expect(
      await screen.findByText("Thank you. Your tip was completed."),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(store.get(settingsAtom).tipCount).toBe(4);
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 3100));
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Send a tip" }),
      ).not.toBeDisabled();
    });
    expect(
      screen.queryByText("Thank you. Your tip was completed."),
    ).not.toBeInTheDocument();
  });

  it("shows error message on purchase failure", async () => {
    (window as unknown as Record<string, unknown>).electronAPI = {
      isMAS: true,
      iapCanMakePayments: vi.fn().mockResolvedValue(true),
      iapGetProducts: vi.fn().mockResolvedValue([mockProduct]),
      iapPurchase: vi
        .fn()
        .mockResolvedValue({ success: false, error: "Purchase failed." }),
    };
    renderWithStore(<SupportView onBack={onBack} />);

    const button = await screen.findByRole("button", { name: "Send a tip" });
    fireEvent.click(button);

    expect(
      await screen.findByText("Purchase failed."),
    ).toBeInTheDocument();
    // 실패 후 버튼이 다시 활성화되어야 한다
    expect(screen.getByRole("button", { name: "Send a tip" })).not.toBeDisabled();
  });

  it("returns to ready state silently when user cancels the IAP dialog", async () => {
    (window as unknown as Record<string, unknown>).electronAPI = {
      isMAS: true,
      iapCanMakePayments: vi.fn().mockResolvedValue(true),
      iapGetProducts: vi.fn().mockResolvedValue([mockProduct]),
      iapPurchase: vi
        .fn()
        .mockResolvedValue({ success: false, cancelled: true }),
    };
    renderWithStore(<SupportView onBack={onBack} />);

    const button = await screen.findByRole("button", { name: "Send a tip" });
    fireEvent.click(button);

    // 취소 후: 에러 메시지 없이 버튼이 다시 활성화되어야 한다
    expect(
      await screen.findByRole("button", { name: "Send a tip" }),
    ).not.toBeDisabled();
    expect(
      screen.queryByText("Purchase failed. Please try again."),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Thank you. Your tip was completed."),
    ).not.toBeInTheDocument();
  });

  it("re-checks canMakePayments on retry", async () => {
    const iapCanMakePayments = vi
      .fn()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true);
    const iapGetProducts = vi
      .fn()
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValueOnce([mockProduct]);
    (window as unknown as Record<string, unknown>).electronAPI = {
      isMAS: true,
      iapCanMakePayments,
      iapGetProducts,
    };
    renderWithStore(<SupportView onBack={onBack} />);

    const retryButton = await screen.findByRole("button", { name: "Try again" });
    fireEvent.click(retryButton);

    expect(await screen.findByText("Coffee")).toBeInTheDocument();
    expect(iapCanMakePayments).toHaveBeenCalledTimes(2);
  });
});
