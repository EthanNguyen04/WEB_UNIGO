// src/components/maketingManager/ReadyOrders.tsx
"use client";

import React, { useState, useEffect } from "react";
import { get_order, change_status_order, BASE_URL } from "../../config";

interface Variant {
  color: string;
  size: string;
  quantity: number;
  price: number;
}

interface Product {
  firstImage: string;
  name: string;
  variants: Variant[];
  price: number;
}

interface Order {
  orderId: string;
  user_id: string;
  shipping_address: {
    address: string;
    phone: string;
  };
  order_status: string;
  payment_status: string;
  products: Product[];
  rawTotal: number;
  purchaseTotal: number;
}

const ORDER_STATUS_LABEL: Record<string, string> = {
  cho_lay_hang: "Chờ lấy",
};
const PAYMENT_STATUS_LABEL: Record<string, string> = {
  chua_thanh_toan: "Chưa thanh toán",
  da_thanh_toan: "Đã thanh toán",
};

const ReadyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);

  const fetchReady = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("tkn");
      const res = await fetch(`${get_order}?status=cho_lay_hang`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data.orders || []);
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReady();
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds(ids =>
      ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]
    );
  };

  const markAsDispatched = async () => {
    if (!selectedIds.length) return;
    setUpdating(true);
    try {
      const token = localStorage.getItem("tkn");
      const res = await fetch(change_status_order, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_ids: selectedIds,
          order_status: "dang_giao",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi cập nhật");
      alert("✅ Đã chuyển sang đang giao");
      await fetchReady();
    } catch (err: any) {
      alert("❌ " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div>Đang tải đơn hàng…</div>;
  if (!orders.length) return <div>Không có đơn chờ lấy.</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Đơn hàng chờ lấy</h2>

      <button
        onClick={markAsDispatched}
        disabled={!selectedIds.length || updating}
        className={`mb-6 px-5 py-2.5 rounded-lg text-white font-medium transition-all duration-200 shadow-md ${
          selectedIds.length && !updating
            ? "bg-green-600 hover:bg-green-700"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {updating ? "Đang xử lý…" : `Đã lấy hàng (${selectedIds.length})`}
      </button>

      <div className="space-y-6">
        {orders.map(o => (
          <div
            key={o.orderId}
            className={`border rounded-xl p-6 bg-white shadow-md transition-transform hover:scale-[1.01] flex gap-4`}
          >
            <div className="pt-1">
              <input
                type="checkbox"
                checked={selectedIds.includes(o.orderId)}
                onChange={() => toggleSelect(o.orderId)}
                className="w-5 h-5 accent-green-600"
              />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-semibold text-gray-800">Mã đơn: {o.orderId}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-700">
                <p><span className="font-medium">User ID:</span> {o.user_id}</p>
                <p><span className="font-medium">Địa chỉ:</span> {o.shipping_address.address}</p>
                <p><span className="font-medium">Phone:</span> {o.shipping_address.phone}</p>
                <p><span className="font-medium">Trạng thái:</span> {ORDER_STATUS_LABEL[o.order_status] || o.order_status}</p>
                <p><span className="font-medium">Thanh toán:</span> {PAYMENT_STATUS_LABEL[o.payment_status] || o.payment_status}</p>
                <p><span className="font-medium">Giá gốc:</span> {o.rawTotal.toLocaleString()}₫</p>
                <p><span className="font-medium">Thanh toán:</span> {o.purchaseTotal.toLocaleString()}₫</p>
              </div>
              <div className="mt-4 space-y-4">
                {o.products.map((p, i) => (
                  <div key={i} className="flex border-t pt-4 gap-4">
                    <img
                      src={BASE_URL + p.firstImage}
                      alt={p.name}
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-gray-800">{p.name}</p>
                      <p className="text-sm text-gray-600">Giá: {p.price.toLocaleString()}₫</p>
                      {p.variants.map((v, vi) => (
                        <p key={vi} className="text-sm text-gray-500">
                          – Màu: {v.color}, Size: {v.size}, Số lượng: {v.quantity}, Giá: {v.price.toLocaleString()}₫
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReadyOrders;
