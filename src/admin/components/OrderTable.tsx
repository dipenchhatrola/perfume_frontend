interface Order {
  id: string;
  user: string;
  total: number;
  status: string;
}

interface Props {
  orders: Order[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export default function OrderTable({ orders, onAccept, onReject }: Props) {
  return (
    <table className="w-full bg-white rounded shadow">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-3 text-left">User</th>
          <th>Total</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {orders.map(order => (
          <tr key={order.id} className="border-t">
            <td className="p-3">{order.user}</td>
            <td>₹{order.total}</td>
            <td>{order.status}</td>
            <td className="space-x-2">
              <button
                onClick={() => onAccept(order.id)}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Accept
              </button>
              <button
                onClick={() => onReject(order.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Reject
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
