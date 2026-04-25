// src/app/Company/top-company/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { useState, useMemo,useEffect } from "react";
import DashboardLayout from "@/components/Company/DashboardLayout";
import { useTopCompanyHandler } from "@/hooks/companyapihandler/useTopCompanyHandler";
import { Clock, File, FileText, PauseCircle, PlayCircle} from 'lucide-react';
import { motion } from "framer-motion";
import {SyncLoader } from "react-spinners";
import DecryptedText from "@/components/ui/DecryptedText";
import { StatsCard } from "@/components/common/stats-card";
import { SearchAndViewBar } from "@/components/common/SearchAndViewBar";
import { Pagination } from "@/components/common/Pagination";
import { CompanyCard } from "@/components/common/CompanyCard";
import { cn } from "@/lib/utils";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { toast } from "sonner";
import { DataTable } from "@/components/common/DataTable";
import { StatsCardSkeleton } from "@/components/common/Skeleton/StatsCardSkeleton";
import { CompanyCardSkeleton } from "@/components/common/Skeleton/CompanyCardSkeleton";


export default function TopCompanyPage() {
  const router = useRouter();
  // useState
  const [showCompanies, setShowCompanies] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const truncateText = (text?: string | null, max = 22) => {
    if (!text) return "N/A";
    return text.length > max ? text.slice(0, max) + "..." : text;
  };
  //hook
  const { topCompanies, loading, error, getTopCompanies} = useTopCompanyHandler();
  //useEffect
  useEffect(() => {
    getTopCompanies(1, 100, searchQuery).catch((err) => {
      console.error('Failed to load top companies:', err);
      toast.error("Failed to load top companies");
    });
  }, [getTopCompanies, searchQuery]);

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(4);
      } else {
        setItemsPerPage(6);
      }
    };
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);
  //filter
  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) {
      return topCompanies;
    }
    const searchLower = searchQuery.toLowerCase();
    return topCompanies.filter(company =>
      company.name?.toLowerCase().includes(searchLower) ||
      company.id?.toLowerCase().includes(searchLower) ||
      company.phoneNumber?.toLowerCase().includes(searchLower) ||
      company.address?.toLowerCase().includes(searchLower) ||
      company.location?.toLowerCase().includes(searchLower) ||
      (company.addresses && company.addresses.some(addr => addr.address?.toLowerCase().includes(searchLower)))
    );
  }, [topCompanies, searchQuery]);
// 📄 Pagination
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const goToPrevious = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const goToNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const VISIBLE_PAGES = 5;

  // Compute start and end of visible page range
  const startPage = Math.max(1, Math.min(currentPage, totalPages - VISIBLE_PAGES + 1));
  const endPage = Math.min(totalPages, startPage + VISIBLE_PAGES - 1);
  const visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  const showPlus = endPage < totalPages; // whether to show "+" button

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalCompanies = topCompanies.length;
  const verifiedCompanies = topCompanies.filter(
    (company) => company.status === "Verified"
  ).length;
  const pendingCompanies = topCompanies.filter(
    (company) => company.status === "Pending"
  ).length;
  const totalEmployees = topCompanies.reduce(
    (sum, company) => sum + (company.employeeNumber || 0),
    0
  );

    const companyStats = useMemo(() => {

      return [
        {
          title: "Total Companies",
          value: totalCompanies,
          subtitle: "All registered companies",
          icon: <FileText className="w-5 h-5 text-primary" />,
          color: "primary",
        },

        {
          title: "Verified Companies",
          value: verifiedCompanies,
          subtitle: "Approved profiles",
          icon: <PlayCircle className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
        },

        {
          title: "Pending Companies",
          value: pendingCompanies,
          subtitle: "Awaiting review",
          icon: <PauseCircle className="w-5 h-5 text-amber-500" />,
          color: "amber",
        },

        {
          title: "Total Employees",
          value: totalEmployees,
          subtitle: "All available contracts",
          icon: <Clock className="w-5 h-5 text-blue-500" />,
          color: "blue",
        },
      ];
    }, [loading, totalCompanies, verifiedCompanies, pendingCompanies, totalEmployees]);


  // Define columns for DataTable

  const columns = [
    {
      header: "ID",
      cell: (company: any) => (
        <span className="text-xs font-medium">
          CO-
          {company.id.startsWith("C")
            ? company.id
            : `C${company.id.slice(0, 6)}`}
        </span>
      ),
    },
    {
      header: "Company Name",
      cell: (company: any) => (
        <span className="text-xs font-medium">
          {truncateText(company.name)}
        </span>
      ),
    },
    {
      header: "Phone",
      cell: (company: any) => {
        const phone =
          company.phoneNumber ||
          company.addresses?.[0]?.phoneNumber ||
          "N/A";

        return (
          <span className="text-xs text-foreground">
            {truncateText(phone)}
          </span>
        );
      },
    },
    {
      header: "Location",
      cell: (company: any) => {
        const location =
          company.location ||
          company.address ||
          company.addresses?.[0]?.address ||
          "N/A";

        return (
          <span className="text-xs text-foreground">
            {truncateText(location, 26)}
          </span>
        );
      },
    },
    {
      header: "Status",
      cell: (company: any) => (
        <span
          className={cn(
            "text-xs inline-flex px-2 py-0.5 rounded-md font-medium",
            company.status === "Verified" &&
              "bg-green-100 text-green-700",
            company.status === "Pending" &&
              "bg-yellow-100 text-yellow-700",
            !company.status && "bg-muted text-muted-foreground"
          )}
        >
          {company.status || "N/A"}
        </span>
      ),
    },
  ];

   return (
       <DashboardLayout>
       <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* ================= HEADER SECTION ================= */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">

          {/* LEFT SIDE */}
          <div>
            <motion.h1
              className="text-3xl font-bold tracking-tight text-foreground"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <DecryptedText
                text="Top Company"
                speed={40}
                maxIterations={20}
                className="revealed"
                parentClassName="inline-block"
              />
            </motion.h1>

            <p className="text-muted-foreground mt-1">
              Discover and manage top-performing companies.
            </p>
          </div>
        </header>
          
        {/* Top row: 4 cards */}
        {/* STATS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                <StatsCardSkeleton key={i} />
                ))
              : companyStats.map((stat, i) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <StatsCard
                      title={stat.title}
                      value={stat.value}
                      subtitle={stat.subtitle}
                      icon={stat.icon}
                      iconColor={stat.color}
                    />
                  </motion.div>
                ))}
          </section>

 
         {/* =====================
             Main Column
         ====================== */}
         <div className="flex flex-col gap-6">
 
           {/* =====================
               Search + Actions Row
           ====================== */}
           <SearchAndViewBar
              searchQuery={searchQuery}
              setSearchQuery={(value) => {
                setSearchQuery(value);
                setCurrentPage(1); // keep your pagination reset
              }}
              viewMode={showCompanies ? "grid" : "list"}
              setViewMode={(mode) => setShowCompanies(mode === "grid")}
              placeholder="Search companies..."
            />
 
           {/* =====================
               Company Grid
           ====================== */}
            {/* Loading State */}
            {loading && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <CompanyCardSkeleton key={i} />
                    ))}
                  </div>
            )}

            {/* Error State */}
            {!loading && error && (
                    <ErrorState 
                      title="Failed to load" 
                      description={error} 
                      onRetry={() => getTopCompanies}
                    />
            )}

            {/* Empty State */}
            {!loading && !error && paginatedCompanies.length === 0 && (
                    <EmptyState
                      icon={<File size={40} />}
                      title="No contracts found"
                      description="No one has applied to any contract yet"
                    />
            )}

            {/* Company Grid */}
            {!loading && !error && paginatedCompanies.length > 0 && showCompanies && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {paginatedCompanies.map((company, index) => (
                 <CompanyCard
                   key={index}
                   company={company}
                   onClick={() =>
                     router.push(
                       `/Company/top-company/${company.id}`
                     )
                   }
                   showMenu={false}
                 />
               ))}
             </div>
           )}
 
           {/* =====================
               Company List
           ====================== */}
           {!loading && !error && paginatedCompanies.length > 0 && !showCompanies && (
            <DataTable
              data={paginatedCompanies}
              columns={columns}
              getId={(company) => company.id}
              selectable={false}
              onRowClick={(company) =>
                router.push(`/Company/top-company/${company.id}`)
              }
              actions={{
                type: "button",
                label: "Details",
                onClick: (company) =>
                  router.push(`/Company/top-company/${company.id}`),
              }}
            />
            )}
         </div>
       </div>
 
       {/* =====================
           Pagination
       ====================== */}
               <Pagination
                 currentPage={currentPage}
                 totalPages={totalPages}
                 visiblePages={visiblePages}
                 loading={loading}
                 error={error}
                 onPageChange={goToPage}
                 onPrevious={goToPrevious}
                 onNext={goToNext}
               />

     </DashboardLayout>
   );
 }