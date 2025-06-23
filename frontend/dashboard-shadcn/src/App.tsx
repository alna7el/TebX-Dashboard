import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./components/ui/card";
import { Button } from "./components/ui/button";
import { formatDate } from "./lib/utils";
import { Activity, Users, RefreshCw } from "lucide-react";

const App: React.FC = () => {
  // Simple state for dashboard metrics
  const [total, setTotal] = useState(25);
  const [completed, setCompleted] = useState(0);
  const [waiting, setWaiting] = useState(5);
  const [withDoctor, setWithDoctor] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const [currentDate] = useState(formatDate(new Date()));

  // Simple simulate function to update metrics
  const simulateProgress = () => {
    if (waiting > 0) {
      setWaiting(waiting - 1);
      setWithDoctor(withDoctor + 1);
    } else if (withDoctor > 0) {
      setWithDoctor(withDoctor - 1);
      setCompleted(completed + 1);
    }
    setLastUpdated(new Date().toLocaleTimeString());
  };

  // Calculate average wait time
  const avgWait = waiting * 15;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl md:text-2xl">TebX Medical Center</CardTitle>
              <p className="text-sm text-muted-foreground">{currentDate}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm">System Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                <span className="text-sm">Demo Mode</span>
              </div>
            </div>
          </CardHeader>
        </Card>
        
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Clinic Overview Card */}
          <Card className="md:row-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Clinic Overview
              </CardTitle>
              <Button size="sm" onClick={simulateProgress} className="flex items-center gap-1">
                <RefreshCw className="h-4 w-4" />
                Simulate Progress
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/70 p-4 rounded-lg shadow-sm">
                  <p className="text-3xl font-semibold">{total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="bg-white/70 p-4 rounded-lg shadow-sm">
                  <p className="text-3xl font-semibold">{completed}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="bg-white/70 p-4 rounded-lg shadow-sm">
                  <p className="text-3xl font-semibold">{waiting}</p>
                  <p className="text-xs text-muted-foreground">Waiting</p>
                </div>
                <div className="bg-white/70 p-4 rounded-lg shadow-sm">
                  <p className="text-3xl font-semibold">{avgWait}</p>
                  <p className="text-xs text-muted-foreground">Avg Wait (min)</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Doctor Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-white/70 rounded-lg shadow-sm">
                    <div>
                      <div className="font-medium">Dr. Sarah Johnson</div>
                      <div className="text-xs text-muted-foreground">Cardiology</div>
                    </div>
                    <div className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                      Available
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/70 rounded-lg shadow-sm">
                    <div>
                      <div className="font-medium">Dr. Ahmed Al-Rashid</div>
                      <div className="text-xs text-muted-foreground">General Medicine</div>
                    </div>
                    <div className="text-xs bg-amber-500 text-white px-2 py-1 rounded-full">
                      Busy
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground w-full text-center">
                Last updated: {lastUpdated}
              </p>
            </CardFooter>
          </Card>
          
          {/* Waiting Room Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Waiting Room
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/70 p-4 rounded-lg shadow-sm">
                  <p className="text-3xl font-semibold">{waiting}</p>
                  <p className="text-xs text-muted-foreground">In Queue</p>
                </div>
                <div className="bg-white/70 p-4 rounded-lg shadow-sm">
                  <p className="text-3xl font-semibold">{withDoctor}</p>
                  <p className="text-xs text-muted-foreground">With Doctor</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {waiting > 0 ? (
                  Array.from({ length: waiting }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-white/70 rounded-lg shadow-sm">
                      <div>
                        <div className="font-medium">Patient {i + 1}</div>
                        <div className="text-xs text-muted-foreground">MRN00{i + 1} • Consultation • 10:{(i * 15) % 60}</div>
                      </div>
                      <div className="text-xs bg-blue-500 text-white h-6 w-6 flex items-center justify-center rounded-full">
                        {i + 1}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">No patients in queue</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground w-full text-center">
                Last updated: {lastUpdated}
              </p>
            </CardFooter>
          </Card>
          
          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 bg-white/70 p-4 rounded-lg shadow-sm">
                <h3 className="font-medium">Patient Check-in</h3>
                <input
                  className="w-full p-2 border rounded-md text-sm"
                  placeholder="Search patient..."
                />
                <Button className="w-full" onClick={() => alert('Patient checked in!')}>
                  Check In
                </Button>
              </div>
              
              <div className="space-y-2 bg-red-50 p-4 rounded-lg border-2 border-red-100">
                <h3 className="font-medium text-red-600">Emergency Booking</h3>
                <select className="w-full p-2 border rounded-md text-sm">
                  <option>High</option>
                  <option>Urgent</option>
                  <option>Critical</option>
                </select>
                <input
                  className="w-full p-2 border rounded-md text-sm"
                  placeholder="Emergency reason..."
                />
                <Button className="w-full bg-red-500 hover:bg-red-600" onClick={() => alert('Emergency created!')}>
                  Create Emergency
                </Button>
              </div>
              
              <div className="space-y-2 bg-white/70 p-4 rounded-lg shadow-sm">
                <h3 className="font-medium">Quick Operations</h3>
                <Button className="w-full" onClick={() => alert('Bulk cancel initiated!')}>
                  Bulk Cancel
                </Button>
                <Button className="w-full bg-amber-500 hover:bg-amber-600 mt-2" onClick={() => alert('Reschedule initiated!')}>
                  Reschedule
                </Button>
                <Button className="w-full bg-slate-200 text-slate-800 hover:bg-slate-300 mt-2" onClick={() => alert('Analytics shown!')}>
                  Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Demo Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-amber-500 text-white text-center py-2 font-bold">
        DEMO MODE - Using simulated data
      </div>
    </div>
  );
};

export default App;
