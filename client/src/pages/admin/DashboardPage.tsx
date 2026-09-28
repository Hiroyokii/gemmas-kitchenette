import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAllOrders } from "../../services/order.service";
import { getTodaySalesReport } from "../../services/report.service";
import type { Order } from "../../types/Order";
import { useAuth } from "../../hooks/useAuth";
import Icon from "../../components/ui/Icon";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { formatDeliveryAddress } from "../../utils/formatDeliveryAddress";

const money = (n: number) =>
  `₱${n.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const dayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

const shortDate = (date: string) =>
  new Date(date).toLocaleDateString("en-PH", {
    day: "numeric",
    month: "short",
  });

export default function DashboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<7 | 30>(7);

  const ordersQuery = useQuery({
    queryKey: ["admin-dashboard-orders"],
    queryFn: () => getAllOrders(1, 100),
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });

  const salesQuery = useQuery({
    queryKey: ["admin-dashboard-today-sales"],
    queryFn: getTodaySalesReport,
    retry: false,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  const orders = useMemo(
    () => ordersQuery.data?.orders ?? [],
    [ordersQuery.data?.orders]
  );

  const chartData = useMemo(() => {
    const count = period === 7 ? 7 : 30;
    const result = Array.from({ length: count }, (_, i) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (count - 1 - i));
      return {
        date,
        label:
          period === 7
            ? date.toLocaleDateString("en", { weekday: "short" })
            : `${date.getDate()}`,
        revenue: 0,
        orders: 0,
      };
    });

    const indices = new Map(
      result.map((point, i) => [dayKey(point.date), i])
    );

    for (const order of orders) {
      if (order.status !== "COMPLETED") continue;
      const date = order.completedAt ?? order.createdAt;
      const index = indices.get(dayKey(new Date(date)));
      if (index !== undefined) {
        result[index].revenue += Number(order.total);
        result[index].orders += 1;
      }
    }

    return result;
  }, [orders, period]);

  const today = salesQuery.data;
  const completed = orders.filter((o) => o.status === "COMPLETED");
  const pending = orders.filter((o) =>
    ["PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"].includes(
      o.status
    )
  );

  const chartMax = Math.max(1, ...chartData.map((d) => d.revenue));
  const totalChartRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
  const maxBars = Math.max(1, ...chartData.map((d) => d.orders));
  const recentOrders = orders
    .filter((order) => order.status === "PENDING")
    .slice(0, 8);

  return (
    <div className="min-h-full bg-[#f7f7f5] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1480px]">
        {/* Header */}
        <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-stone-500">
              Good day, {user?.firstName}
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-950">
              Sales overview
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Your kitchen operations at a glance.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-600 shadow-sm">
            <Icon name="calendar" className="h-4 w-4 text-[#b98200]" />
            {new Date().toLocaleDateString("en-PH", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </header>

        {/* Error Alerts */}
        {ordersQuery.isError && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            Could not load order data:{" "}
            {getErrorMessage(ordersQuery.error, "Please try again.")}
          </div>
        )}
        {salesQuery.isError && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          >
            Today's sales summary is temporarily unavailable. The charts below
            use the available order history.
          </div>
        )}

        {/* Key Metrics */}
        <section
          aria-label="Key metrics"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <Metric
            title="Today's revenue"
            value={today ? money(today.totalRevenue) : "—"}
            note={
              today
                ? `${today.completedOrders} completed orders`
                : "Loading today's report"
            }
            icon="chart"
          />
          <Metric
            title="Orders today"
            value={today ? String(today.totalOrders) : "—"}
            note={
              today
                ? `${today.cancelledOrders} cancelled`
                : "From today's sales report"
            }
            icon="list"
          />
          <Metric
            title="Open orders"
            value={ordersQuery.isLoading ? "—" : String(pending.length)}
            note="Needs preparation or handoff"
            icon="calendar"
            emphasis
          />
          <Metric
            title="Completed orders"
            value={ordersQuery.isLoading ? "—" : String(completed.length)}
            note="In the latest 100 orders"
            icon="bowl"
          />
        </section>

        {/* Charts & Analytics */}
        <section className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_1fr]">
          {/* Revenue Analytics */}
          <article className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-stone-900">
                  Revenue analytics
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  Completed order revenue ·{" "}
                  {period === 7 ? "last 7 days" : "last 30 days"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-stone-900">
                  {money(totalChartRevenue)}
                </p>
                <label className="sr-only" htmlFor="revenue-period">
                  Chart period
                </label>
                <select
                  id="revenue-period"
                  value={period}
                  onChange={(e) => setPeriod(Number(e.target.value) as 7 | 30)}
                  className="mt-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-600 outline-none focus:border-[#FFB800]"
                >
                  <option value={7}>This week</option>
                  <option value={30}>Last 30 days</option>
                </select>
              </div>
            </div>

            <div className="-mx-1 mt-6 overflow-x-auto px-1 pb-1">
              <div className={`flex h-48 w-full items-end border-b border-stone-100 px-1 pb-0 sm:h-56 ${period === 30 ? "gap-0.5 sm:gap-1" : "gap-2 sm:gap-3"}`}>
                {chartData.map((d, i) => {
                const maxIndex = chartData.reduce(
                  (best, point, index, arr) =>
                    point.revenue > arr[best].revenue ? index : best,
                  0
                );
                const isMax = i === maxIndex && d.revenue > 0;

                return (
                  <div
                    key={dayKey(d.date)}
                    className="group flex h-full min-w-0 flex-1 flex-col justify-end"
                  >
                    <div className="relative flex h-full items-end">
                      <div
                        title={`${shortDate(dayKey(d.date))}: ${money(d.revenue)}`}
                        className={`w-full rounded-t-lg transition-colors ${
                          isMax
                            ? "bg-[#FFB800]"
                            : "bg-[#ffda80] group-hover:bg-[#ffc83d]"
                        }`}
                        style={{
                          height: `${Math.max(
                            d.revenue ? 8 : 2,
                            (d.revenue / chartMax) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className={`h-7 truncate pt-2 text-center text-stone-500 ${period === 30 ? "text-[8px] sm:text-[10px]" : "text-[10px] sm:text-xs"}`}>
                      {d.label}
                    </span>
                  </div>
                );
                })}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-stone-400">
              <span>Daily revenue</span>
              <span>
                {chartData.filter((d) => d.revenue > 0).length} days with completed
                sales
              </span>
            </div>
          </article>

          {/* Order Activity */}
          <article className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <h2 className="text-base font-semibold text-stone-900">
                Order activity
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                Completed orders · selected period
              </p>
            </div>
            <div className="mt-7 space-y-4">
              {chartData
                .filter(
                  (_, i) =>
                    period === 7 ||
                    i % 4 === 0 ||
                    i === chartData.length - 1
                )
                .map((d) => (
                  <div key={dayKey(d.date)} className="flex items-center gap-3">
                    <span className="w-10 shrink-0 text-xs text-stone-500">
                      {period === 7 ? d.label : shortDate(dayKey(d.date))}
                    </span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-stone-100">
                      <div
                        className="h-full rounded-full bg-stone-900"
                        style={{
                          width: `${Math.max(
                            d.orders ? 8 : 0,
                            (d.orders / maxBars) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="w-6 text-right text-xs font-medium text-stone-700">
                      {d.orders}
                    </span>
                  </div>
                ))}
            </div>
          </article>
        </section>

        {/* Recent Orders Table */}
        <section className="mt-5 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-stone-900">
                Recent orders
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                New orders awaiting confirmation. They leave this list when confirmed.
              </p>
            </div>
            <Link
              to="/admin/orders"
              className="rounded-lg bg-[#FFB800] px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-[#e5a500]"
            >
              Manage orders
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] table-fixed text-left text-sm">
              <colgroup>
                <col className="w-[10%]" />
                <col className="w-[12%]" />
                <col className="w-[27%]" />
                <col className="w-[15%]" />
                <col className="w-[10%]" />
                <col className="w-[13%]" />
                <col className="w-[13%]" />
              </colgroup>
              <thead>
                <tr className="border-y border-stone-100 text-xs text-stone-500">
                  <th className="px-3 py-3 font-medium sm:px-4">Order</th>
                  <th className="px-3 py-3 font-medium sm:px-4">Date</th>
                  <th className="px-3 py-3 font-medium sm:px-4">Customer</th>
                  <th className="px-3 py-3 font-medium sm:px-4">Payment mode</th>
                  <th className="px-3 py-3 font-medium sm:px-4">Items</th>
                  <th className="px-3 py-3 font-medium sm:px-4">Status</th>
                  <th className="px-3 py-3 text-right font-medium sm:px-4">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {ordersQuery.isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-500">
                      Loading recent orders…
                    </td>
                  </tr>
                ) : recentOrders.length ? (
                  recentOrders.map((order) => (
                    <OrderRow key={order.id} order={order} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-500">
                      No new orders awaiting confirmation.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Quick Operations Links */}
        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-stone-900">
                Kitchen operations
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                Jump directly to any admin task.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Daily menu", "/admin/menu", "Plan today's menu"],
              ["Food catalog", "/admin/foods", "Manage dishes and categories"],
              ["Ingredients", "/admin/ingredients", "Maintain stock items"],
              ["Recipes", "/admin/recipes", "Manage recipe usage"],
              ["Purchases", "/admin/purchases", "Record incoming stock"],
              ["Spoilage", "/admin/spoilage", "Review stock loss"],
              ["All orders", "/admin/orders", "Update and fulfill orders"],
            ].map(([title, to, description]) => (
              <Link
                key={to}
                to={to}
                className="group rounded-xl border border-stone-200 bg-white p-4 transition hover:border-[#FFB800] hover:shadow-sm"
              >
                <span className="text-sm font-semibold text-stone-800 group-hover:text-stone-950">
                  {title}
                  <span className="ml-2 text-[#b98200]" aria-hidden="true">
                    ↗
                  </span>
                </span>
                <span className="mt-1 block text-xs text-stone-500">
                  {description}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({
  title,
  value,
  note,
  icon,
  emphasis = false,
}: {
  title: string;
  value: string;
  note: string;
  icon: "chart" | "list" | "calendar" | "bowl";
  emphasis?: boolean;
}) {
  return (
    <article className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-stone-500">{title}</p>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            emphasis
              ? "bg-[#fff2cc] text-[#956900]"
              : "bg-stone-100 text-stone-600"
          }`}
        >
          <Icon name={icon} className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-stone-950">
        {value}
      </p>
      <p className="mt-2 text-xs text-stone-500">{note}</p>
    </article>
  );
}

function OrderRow({ order }: { order: Order }) {
  const statusClass =
    order.status === "COMPLETED"
      ? "bg-emerald-50 text-emerald-700"
      : order.status === "CANCELLED"
      ? "bg-red-50 text-red-700"
      : order.status === "PENDING"
      ? "bg-amber-50 text-amber-800"
      : "bg-stone-100 text-stone-700";

  return (
    <tr className="text-stone-700">
      <td className="px-3 py-3 font-semibold text-stone-900 sm:px-4">
        #{order.dailyOrderNumber}
      </td>
      <td className="px-3 py-3 whitespace-nowrap sm:px-4">
        {shortDate(order.createdAt)}
      </td>
      <td className="px-3 py-3 sm:px-4">
        {order.customer.firstName} {order.customer.lastName}
        <span className="mt-1 block max-w-56 text-xs font-normal text-stone-500">{order.deliveryAddress ? formatDeliveryAddress(order.deliveryAddress) : (order.orderType === "PICKUP" ? "Pickup" : "Address unavailable")}</span>
        {order.notes && <span className="mt-1 block max-w-56 text-xs font-normal text-stone-600">Note: {order.notes}</span>}
      </td>
      <td className="px-3 py-3 whitespace-nowrap sm:px-4">
        {order.payment?.method === "GCASH" ? "GCash" : order.payment?.method === "COD" ? "Cash on delivery" : "—"}
      </td>
      <td className="px-3 py-3 sm:px-4">
        {order.orderItems.reduce((sum, item) => sum + item.quantity, 0)} items
      </td>
      <td className="px-3 py-3 sm:px-4">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}
        >
          {order.status.replaceAll("_", " ")}
        </span>
      </td>
      <td className="px-3 py-3 text-right font-semibold text-stone-900 sm:px-4">
        {money(Number(order.total))}
      </td>
    </tr>
  );
}
