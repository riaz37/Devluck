// src/app/Student/top-company/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/Student/DashboardLayout";
import { useCompanyGlobalRankingHandler } from "@/hooks/common/useCompanyGlobalRankingHandler";
import { Clock, File, FileText, PauseCircle, PlayCircle, Trophy} from 'lucide-react';
import { motion } from "framer-motion";
import { SyncLoader } from "react-spinners";
import DecryptedText from "@/components/ui/DecryptedText";
import { StatsCard } from "@/components/common/stats-card";
import { EmptyState } from "@/components/common/EmptyState";
import { SearchAndViewBar } from "@/components/common/SearchAndViewBar";
import { ErrorState } from "@/components/common/ErrorState";
import { CompanyCard } from "@/components/common/CompanyCard";
import { toast } from "sonner";
import { TopCompany } from "@/types/company";
import { DataTable } from "@/components/common/DataTable";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/common/Pagination";
import { StatsCardSkeleton } from "@/components/common/Skeleton/StatsCardSkeleton";
import { CompanyCardSkeleton } from "@/components/common/Skeleton/CompanyCardSkeleton";


export default function TopCompanyPage() {
  const router = useRouter();
//useState
  const [showCompanies, setShowCompanies] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
//hook
  const { rankings, listCompanyGlobalRankings ,loading, error  } = useCompanyGlobalRankingHandler();
//useEffect
  useEffect(() => {
    listCompanyGlobalRankings({ page: 1, limit: 100 }).catch((err) => {
      console.error('Failed to load top companies:', err);
      toast.error("Failed to load top companies");
    });
  }, [listCompanyGlobalRankings]);
//filter
  const filteredCompanies = useMemo(() => {
    const topCompanies: TopCompany[] = rankings.map((item) => ({
      id: item.company.id,
      name: item.company.name,
      logo: item.company.logo,
      image: item.company.logo,
      phoneNumber:
        item.company.phoneNumber ||
        item.company.addresses.find((addr) => addr.phoneNumber)?.phoneNumber ||
        null,
      address: item.company.address,
      addresses: item.company.addresses.map((addr) => ({
        id: addr.id,
        name: addr.name ?? undefined,
        tag: addr.tag ?? undefined,
        address: addr.address ?? undefined,
        phoneNumber: addr.phoneNumber ?? undefined
      })),
      status: item.company.status,
      industry: item.company.industry,
      location: item.company.location,
      website: item.company.website,
      size: item.company.size,
      employeeNumber: 0,
      opportunityCount: 0,
      contractsCount: Math.round(item.contractsScore ?? 0),
      globalRank: item.globalRank
    }));
    if (!topCompanies || topCompanies.length === 0) return [];
    
    return topCompanies.filter(company => {
      const searchMatch =
        !searchQuery.trim() ||
        company.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(company.phoneNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(company.address || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (company.addresses && company.addresses.some(addr => 
          addr.address?.toLowerCase().includes(searchQuery.toLowerCase())
        ));
  
      return searchMatch;
    });
  }, [rankings, searchQuery]);
     
     
         
// 📄 Pagination
const [itemsPerPage, setItemsPerPage] = useState(10); // default 10 for desktop

        useEffect(() => {
          const updateItemsPerPage = () => {
            if (window.innerWidth < 640) { // mobile
              setItemsPerPage(4);
            } else {
              setItemsPerPage(8); // desktop
            }
          };

          updateItemsPerPage(); // run once on mount
          window.addEventListener("resize", updateItemsPerPage); // run on resize

          return () => window.removeEventListener("resize", updateItemsPerPage);
        }, []);

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

        const totalCompanies = filteredCompanies.length;

        const verifiedCompanies = filteredCompanies.filter(
          (company) => company.status === "Verified"
        ).length;

        const pendingCompanies = filteredCompanies.filter(
          (company) => company.status === "Pending"
        ).length;

        const totalContracts = filteredCompanies.reduce(
          (sum, company) => sum + (company.contractsCount || 0),
          0
        );

      const companyStats = useMemo(() => {
      const formatValue = (val: number) =>
        loading ? (
          <SyncLoader size={8} color="#D4AF37" />
        ) : (
          <span style={{ color: val === 0 ? "gray" : "inherit" }}>
            {val.toString()}
          </span>
        );

      return [
        {
          title: "Total Companies",
          value: formatValue(totalCompanies),
          subtitle: "All registered companies",
          icon: <FileText className="w-5 h-5 text-primary" />,
          color: "primary",
        },

        {
          title: "Verified Companies",
          value: formatValue(verifiedCompanies),
          subtitle: "Approved profiles",
          icon: <PlayCircle className="w-5 h-5 text-emerald-500" />,
          color: "emerald",
        },

        {
          title: "Pending Companies",
          value: formatValue(pendingCompanies),
          subtitle: "Awaiting review",
          icon: <PauseCircle className="w-5 h-5 text-amber-500" />,
          color: "amber",
        },

        {
          title: "Total Employees",
          value: formatValue(totalContracts),
          subtitle: "All available contracts",
          icon: <Clock className="w-5 h-5 text-blue-500" />,
          color: "blue",
        },
      ];
    }, [loading, totalCompanies, verifiedCompanies, pendingCompanies, totalContracts]);

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
                      text="Top Companies"
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
                title="Failed to load companies"
                description={error || "We couldn’t fetch companies. Please try again."}
                onRetry={() => listCompanyGlobalRankings({ page: 1, limit: 100 })}
              />
            )}

            {/* Empty State */}
            {!loading && !error && paginatedCompanies.length === 0 && (
              <EmptyState
                icon={<File size={40} />}
                title="No companies found"
                description="No companies are available at the moment."
              />
            )}

           {!loading && !error && paginatedCompanies.length > 0 && showCompanies && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {paginatedCompanies.map((company, index) => (
                 <CompanyCard
                   key={index}
                   company={company}
                   onClick={() =>
                     router.push(
                       `/Student/top-company/${company.id}`
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
             <>
              <DataTable
                data={paginatedCompanies}
                getId={(c) => c.id}
                selectable={false}
                onRowClick={(c) =>
                  router.push(`/Student/top-company/${c.id}`)
                }
                actions={{
                  type: "button",
                  label: "Details",
                  onClick: (c) =>
                    router.push(`/Student/top-company/${c.id}`),
                }}
                columns={[

                  {
                    header: "ID",
                    cell: (c: TopCompany) =>
                      `CO-${c.id.startsWith("C") ? c.id : `C${c.id.slice(0, 6)}`}`,
                  },
                  {
                    header: "Name",
                    cell: (c: TopCompany) => c.name,
                  },
                  {
                    header: "Rank",
                    cell: (c: TopCompany) =>
                      typeof c.globalRank === "number" ? (
                        <div className="flex items-center gap-1">
                          <Trophy className="h-3.5 w-3.5" />
                          {c.globalRank}
                        </div>
                      ) : (
                        "N/A"
                      ),
                  },
                  {
                    header: "Phone",
                    cell: (c: TopCompany) => c.phoneNumber ?? "N/A",
                  },
                  {
                    header: "Location",
                    cell: (c: TopCompany) =>
                      c.location ||
                      c.address ||
                      c.addresses?.[0]?.address ||
                      "N/A",
                  },
                  {
                    header: "Status",
                    cell: (c: TopCompany) => (
                      <span
                        className={cn(
                          "px-2 py-1 rounded-md text-xs font-medium",
                          c.status === "Verified" &&
                            "bg-green-100 text-green-700 ",
                          c.status === "Pending" &&
                            "bg-yellow-100 text-yellow-700 ",
                          (!c.status ||
                            (c.status !== "Verified" &&
                              c.status !== "Pending")) &&
                            "bg-gray-100 text-gray-600 "
                        )}
                      >
                        {c.status || "N/A"}
                      </span>
                    ),
                  },
                ]}
              />
             </>
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