// src/pages/Dashboard.jsx
import React, { useEffect, useState, useMemo} from "react";
import KpiCard from "../components/dashboard/KpiCard";
import MiniBar from "../components/dashboard/MiniBar";
import { ReportsAPI, RecordsAPI } from "../services/api";
import { currency } from "../utils/currency";
import Card from "../components/ui/Card";
import { useAuth } from "../hooks/useAuth";   
import { UsersAPI } from "../services/api";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import { use } from "react";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [byService, setByService] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [agencyUsers, setAgencyUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("all");


   const { user, logout } = useAuth();

     const filteredRecords = useMemo(() => {
    if (selectedUser === "all") {
      return recentRecords;
    } else {
      return recentRecords.filter((record) => record.createdBy === selectedUser);
    }
  }, [recentRecords, selectedUser]);

     useEffect(() => {
  if (user.role === "AGENCY_ADMIN") {
    UsersAPI.list({ agencyId: user.agency._id || user.agency })
      .then(setAgencyUsers)
      .catch((err) => console.error("Failed to load users", err));

  } else if (user.role === "SUPER_ADMIN") {
    UsersAPI.list()
      .then(setAgencyUsers)
      .catch((err) => console.error("Failed to load users", err));

  }


}, [user]);



 useEffect(() => {
  (async () => {
    const filter = {};
    if (selectedUser !== "all") {
      filter.createdBy = selectedUser;
    }

    // By Service (with filter)
    const bs = await ReportsAPI.byService({ ...filter, range: "7d" });
    setByService(bs);

    // Trend (with filter)
    const trend = await ReportsAPI.trend({ ...filter, group: "day", range: "7d" });

    // Summary
    const s = await ReportsAPI.summary(filter);
    setSummary(s);

    // Recent Records
    const recs = await RecordsAPI.list(filter);
    setRecentRecords(recs);

    // Fill last 7 days
    const today = dayjs();
    const days = Array.from({ length: 7 }).map((_, i) =>
      today.subtract(6 - i, "day").format("YYYY-MM-DD")
    );
    const lookup = {};
    trend.forEach((t) => {
      lookup[t.period] = Number(t.profit) || 0;
    });
    const filled = days.map((d) => ({
      period: d,
      profit: lookup[d] ?? 0,
    }));
    setTrendData(filled);
  })();
}, [selectedUser]);
  

  if (!summary)
    return (
      <>

         <>
  {new Date().getHours() < 12 ? "Good Morning" : "Good Afternoon"}!  :  {user?.name ? user.name || user.name : "MyAgency"}
</>
        <div>Loading Dashboard...</div>

      

      </>
    );
 
  // Create a lookup map for userId → name
const userMap = {};
agencyUsers.forEach((u) => {
  userMap[u._id] = u.name;
});

  

  return (
    <div>
      {/* greetings the user with a dashboard view and with time of day based message */}
      <div className="text-lg font-semibold">
       <>
  {new Date().getHours() < 12 ? "Good Morning" : "Good Afternoon"}!  :  {user?.name ? user.name || user.name : "MyAgency"}
</>
      </div>

      <div className="space-y-6 p-2 md:p-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Income" value={currency(summary.totalIncome)} />
          <KpiCard label="Expenses" value={currency(summary.totalExpenses)} />
          <KpiCard label="Profit" value={currency(summary.totalProfit)} />
          <KpiCard label="Records" value={summary.count} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 ">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-2">Profit (Last 7 Days)</h2>
            <div className="w-full h-64 md:h-80 dark:text-slate-5">
              <ResponsiveContainer>
                <LineChart data={trendData}>
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4">
            <MiniBar
              title="Profit by Service"
              data={byService.map((s) => ({
                label: s._id,
                value: s.totalProfit ?? s.commission,
              }))}
            />
          </Card>
        </div>

        {/* Recent Records
        <Card className="p-4 overflow-x-auto">
          <h2 className="text-lg font-semibold mb-4">Recent Records</h2>
          <table className="min-w-full border text-xs sm:text-sm">
            <thead className="bg-slate-100">
              <tr className=" dark:text-white dark:bg-slate-700 ">
                <th className="p-2 border">Customer</th>
                <th className="p-2 border">Service</th>
                <th className="p-2 border">Commission</th>
                <th className="p-2 border">Recorded By</th>
                <th className="p-2 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentRecords.map((r) => (
                <tr key={r._id} className=" dark:hover:bg-slate-700 dark:text-white ">
                  <td className="p-2 border">{r.customerName}</td>
                  <td className="p-2 border">{r.typeOfService}</td>
                  <td className="p-2 border">{currency(r.commission)}</td>
                  <td className="p-2 border">{r.createdBy?.name || r.createdBy}</td>
                  <td className="p-2 border">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card> */}


        {/* User Selection */}
        {/* User Selection */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Select User</h2>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="border rounded-md p-2 dark:text-slate-800"
          >
            <option value="all">All Users</option>
            {agencyUsers.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>

          <table className="min-w-full border text-xs sm:text-sm">
            <thead className="bg-slate-100">
              <tr className=" dark:text-white dark:bg-slate-700 ">
                <th className="p-2 border">Customer</th>
                <th className="p-2 border">Service</th>
                <th className="p-2 border">Commission</th>
                <th className="p-2 border">Recorded By</th>
                <th className="p-2 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r) => (  // Use filteredRecords here
                <tr
                  key={r._id}
                  className=" dark:hover:bg-slate-700 dark:text-white "
                >
                  <td className="p-2 border">{r.customerName}</td>
                  <td className="p-2 border">{r.typeOfService}</td>
                  <td className="p-2 border">{currency(r.commission)}</td>
                  {/* <td className="p-2 border">{r.createdBy?.name || r.createdBy}</td> */}
                  <td className="p-2 border">
                    {r.createdBy?.name || userMap[r.createdBy] || r.createdBy}
                  </td>
                  <td className="p-2 border">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
