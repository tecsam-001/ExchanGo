"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Image from "next/image";
import { DashboardAnalyticsData } from "@/services/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend
);

interface AlertCardProps {
  title: string;
  value: string | number;
  percentage?: string | number;
  hasPercentage?: boolean;
  isPositive?: boolean;
}

interface KeyStatChartProps {
  dashboardData?: DashboardAnalyticsData;
  isLoading?: boolean;
}

const AlertCard: React.FC<AlertCardProps> = ({
  title,
  value,
  percentage,
  hasPercentage = false,
  isPositive = true,
}) => {
  return (
    <div
      className="lg:w-[248px] border border-[#DEDEDE] bg-white rounded-lg p-4 cursor-pointer transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1 group relative overflow-hidden"
      style={{ boxShadow: "0px 1px 1px 0px #0000000F" }}
    >
      <div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow:
            "0px 4px 12px rgba(0, 0, 0, 0.12), 0px 2px 4px rgba(0, 0, 0, 0.08)",
        }}
      />

      <div className="absolute inset-0 bg-gray-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />

      <div className="relative z-10">
        <div className="flex items-center gap-1">
          <h2 className="text-[#585858] text-[14px] leading-[20px] font-normal truncate group-hover:text-[#404040] transition-colors duration-200">
            {title}
          </h2>
          <div className="transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12">
            <Image src="/assets/info.svg" alt="info" width={14} height={14} />
          </div>
        </div>

        <div className="mt-3.5 flex items-center gap-1.5">
          <h2 className="text-[#111111] text-[32px] leading-[38px] font-semibold group-hover:text-black transition-colors duration-200">
            {value}
          </h2>

          {hasPercentage && (
            <div
              className={`mt-2.5 ${
                isPositive
                  ? "bg-[#C2ECD2] group-hover:bg-[#B8E6C1]"
                  : "bg-[#FECACA] group-hover:bg-[#FEB8B8]"
              } rounded-[1000px] px-1.5 py-0.5 flex justify-center gap-0.5 transition-all duration-200 group-hover:scale-105`}
            >
              <div className="transition-transform duration-200 group-hover:scale-110">
                <Image
                  src={
                    isPositive
                      ? "/assets/arrow-up.svg"
                      : "/assets/arrow-down.svg"
                  }
                  alt="arrow"
                  width={14.19}
                  height={14.19}
                />
              </div>
              <h3
                className={`${
                  isPositive ? "text-[#20523C]" : "text-[#991B1B]"
                } text-[12px] leading-[17px] font-normal mt-[1px] transition-colors duration-200`}
              >
                {percentage}%
              </h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const KeyStatChart: React.FC<KeyStatChartProps> = ({
  dashboardData,
  isLoading = false,
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<ChartJS | null>(null);

  // Process key stats data for the chart
  const processChartData = () => {
    if (!dashboardData || !dashboardData.keyStats) {
      // Return default data if no data is available
      return {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            data: [0, 0, 0, 0, 0, 0, 0],
            backgroundColor: "#4ADE80",
            borderColor: "#4ADE80",
            borderWidth: 0,
            borderRadius: 4,
            borderSkipped: false,
          },
        ],
      };
    }

    // Get the last 7 days of data for the chart
    const lastSevenDays = dashboardData.keyStats.slice(-7);

    return {
      labels: lastSevenDays.map((item) => item.day),
      datasets: [
        {
          data: lastSevenDays.map((item) => item.value),
          backgroundColor: "#4ADE80",
          borderColor: "#4ADE80",
          borderWidth: 0,
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    };
  };

  // Get chart data
  const chartData = processChartData();

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      if (!ctx) {
        console.error("Failed to get 2D context from canvas");
        return;
      }

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new ChartJS(chartRef.current, {
        type: "bar",
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              enabled: true,
              backgroundColor: "#1F2937",
              titleColor: "#FFFFFF",
              bodyColor: "#FFFFFF",
              borderColor: "#374151",
              borderWidth: 1,
              cornerRadius: 6,
              displayColors: false,
              callbacks: {
                title: function (context) {
                  return context[0].label;
                },
                label: function (context) {
                  return `Value: ${context.parsed.y}`;
                },
              },
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
              border: {
                display: false,
              },
              ticks: {
                color: "#6B7280",
                font: {
                  size: 12,
                },
              },
            },
            y: {
              display: false,
              beginAtZero: true,
              max: Math.max(...chartData.datasets[0].data) * 1.2 || 100, // Dynamic max value with 20% padding
            },
          },
          onHover: (event, activeElements) => {
            if (event.native?.target && "style" in event.native.target) {
              (event.native.target as HTMLElement).style.cursor =
                activeElements.length > 0 ? "pointer" : "default";
            }
          },
          elements: {
            bar: {
              borderRadius: 4,
            },
          },
          animation: {
            duration: 300,
            easing: "easeOutQuart",
          },
          interaction: {
            intersect: false,
            mode: "index",
          },
        },
        plugins: [
          {
            id: "hoverAnimation",
            beforeDatasetsDraw: (chart) => {
              const activeElements = chart.getActiveElements();
              if (activeElements.length > 0) {
                const activeIndex = activeElements[0].index;
                const meta = chart.getDatasetMeta(0);
                const bar = meta.data[activeIndex];

                if (bar) {
                  const ctx = chart.ctx;
                  ctx.save();
                  ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
                  ctx.shadowBlur = 8;
                  ctx.shadowOffsetX = 0;
                  ctx.shadowOffsetY = 4;

                  const originalColor = "#4ADE80";
                  const dataset = chart.data.datasets[0];
                  dataset.backgroundColor = dataset.data.map((_, index) =>
                    index === activeIndex ? "#22C55E" : originalColor
                  );
                }
              }
            },
          },
        ],
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData]);

  if (isLoading) {
    return (
      <div className="flex items-start justify-between gap-4 lg:flex-row flex-col-reverse">
        <div className="border border-[#DEDEDE] rounded-lg bg-white p-4 w-full animate-pulse">
          <div className="h-4 w-24 bg-gray-200 rounded mb-4"></div>
          <div className="h-[149px] w-full bg-gray-100 rounded"></div>
        </div>
        <div className="lg:flex flex-col grid grid-cols-2 gap-2.5 sm:gap-4 text-nowrap">
          <div className="lg:w-[248px] border border-[#DEDEDE] bg-white rounded-lg p-4 animate-pulse">
            <div className="h-4 w-24 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 w-16 bg-gray-100 rounded"></div>
          </div>
          <div className="lg:w-[248px] border border-[#DEDEDE] bg-white rounded-lg p-4 animate-pulse">
            <div className="h-4 w-24 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 w-16 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-4 lg:flex-row flex-col-reverse">
      {/* Chart */}
      <div
        className="border border-[#DEDEDE] rounded-lg bg-white p-4 w-full"
        style={{ boxShadow: "0px 1px 1px 0px #0000000F" }}
      >
        <h3 className="text-[#111111] text-[16px] font-bold leading-[19px] mb-4">
          Key Stat
        </h3>
        <div className="relative h-[149px] w-full">
          <canvas ref={chartRef} className="w-full h-full" />
        </div>
      </div>

      <div className="lg:flex flex-col grid grid-cols-2 gap-2.5 sm:gap-4 text-nowrap">
        <AlertCard
          title="WA Alert Price"
          value={dashboardData?.waAlertPrice?.total || 0}
          percentage={dashboardData?.waAlertPrice?.percentageChange || 0}
          hasPercentage={true}
          isPositive={
            Number(dashboardData?.waAlertPrice?.percentageChange || 0) >= 0
          }
        />

        <AlertCard
          title="Rate Alert Frequency"
          value={dashboardData?.rateAlertFrequency || "0x"}
          hasPercentage={false}
        />
      </div>
    </div>
  );
};

export default KeyStatChart;
