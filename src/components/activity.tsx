"use client"

import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Define the type for a single activity
type Activity = {
  id: string
  status: "Received" | "Sent"
  date: string
  address: string
  amount: string
  valueUSD: number
}

// Define the props type for the Activity component
type ActivityProps = {
  activities: Activity[]
}

export default function Activity({ activities }: ActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {activity.status === "Received" ? (
                      <ArrowDownIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowUpIcon className="h-4 w-4 text-red-500" />
                    )}
                    {activity.status}
                  </div>
                </TableCell>
                <TableCell>{activity.date}</TableCell>
                <TableCell className="font-mono text-xs">
                  {activity.address}
                </TableCell>
                <TableCell>
                  <div>{activity.amount}</div>
                  <div className="text-xs text-muted-foreground">
                    ${activity.valueUSD.toFixed(2)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// Example array of activities to be passed as props
const exampleActivities: Activity[] = [
  {
    id: "1",
    status: "Received",
    date: "August 14, 2024 3:08 PM",
    address: "From: 0xe7f4...f156",
    amount: "0.005 ETH",
    valueUSD: 13.15,
  },
  {
    id: "2",
    status: "Sent",
    date: "August 13, 2024 1:45 PM",
    address: "To: 0x1a2b...3c4d",
    amount: "0.01 ETH",
    valueUSD: 26.3,
  },
  {
    id: "3",
    status: "Received",
    date: "August 12, 2024 9:30 AM",
    address: "From: 0x5e6f...7g8h",
    amount: "0.02 ETH",
    valueUSD: 52.6,
  },
]

export function WrappedActivity() {
  return <Activity activities={exampleActivities} />
}
