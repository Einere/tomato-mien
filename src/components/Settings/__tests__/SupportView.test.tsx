import { render, screen } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { Provider } from "jotai";
import { createStore } from "jotai";
import { settingsAtom } from "@/store";
import { SupportView } from "../SupportView";

function renderWithStore(ui: React.ReactElement, tipCount = 0) {
  const store = createStore();
  store.set(settingsAtom, { timeFormat: "24h", enabledPlugins: [], tipCount });
  return render(<Provider store={store}>{ui}</Provider>);
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

  it("renders IAPSupportContent when MAS", () => {
    (window as unknown as Record<string, unknown>).electronAPI = {
      isMAS: true,
      iapCanMakePayments: vi.fn().mockResolvedValue(true),
      iapGetProducts: vi.fn().mockResolvedValue([]),
    };
    renderWithStore(<SupportView onBack={onBack} />);
    expect(
      screen.queryByRole("img", { name: /toss support qr code/i }),
    ).not.toBeInTheDocument();
  });

  it("shows tip count when tipCount > 0 in MAS mode", async () => {
    const mockProduct = {
      productIdentifier: "com.tomatomien.tip",
      localizedTitle: "Coffee",
      localizedDescription: "Buy a coffee",
      formattedPrice: "₩1,100",
      price: 1100,
    };
    (window as unknown as Record<string, unknown>).electronAPI = {
      isMAS: true,
      iapCanMakePayments: vi.fn().mockResolvedValue(true),
      iapGetProducts: vi.fn().mockResolvedValue([mockProduct]),
    };
    renderWithStore(<SupportView onBack={onBack} />, 5);
    expect(
      await screen.findByText(/5잔의 커피를 보내주셨어요/),
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
      await screen.findByText(/결제를 사용할 수 없습니다/),
    ).toBeInTheDocument();
  });
});
