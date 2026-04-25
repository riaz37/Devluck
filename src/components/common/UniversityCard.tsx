"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

import {
  MoreVertical,
  MapPin,
  Phone,
  Eye,
  Pencil,
  Trash2,
  GraduationCap,
  Fingerprint,
} from "lucide-react";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { University } from "@/hooks/companyapihandler/useUniversityHandler";
import { Badge } from "@/components/ui/badge";
import { InfoItem } from "./info-item";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type UniversityCardProps = {
  university: University;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  showMenu?: boolean;
};

export function UniversityCard({
  university,
  onEdit,
  onDelete,
  onClick,
  showMenu = true
}: UniversityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="w-full max-w-sm mx-auto"
    >
      <Card className="relative p-2 overflow-hidden rounded-xl border  shadow-sm hover:shadow-md transition-all">
        <div className="relative  flex flex-col items-center justify-center">
          
            {/* LEFT TOP (ID + STATUS) */}
            <div className="absolute left-1 top-1 z-10 flex flex-col gap-1">
              <div className="flex items-center gap-1 bg-black/40 text-white px-2 py-0.5 rounded-md text-[12px] backdrop-blur">
                <Fingerprint className="h-3 w-3" />
                {(university.id || "").slice(0, 8).toUpperCase()}
              </div>
            </div>
            {/* RIGHT TOP (MENU) */}
            <div className="absolute right-1 top-1 z-10">
              {showMenu && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-12 w-12 rounded-full  backdrop-blur flex items-center justify-center transition"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">

                    <DropdownMenuItem onClick={onClick} className="cursor-pointer">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="text-red-500 cursor-pointer "
                      onClick={onDelete}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>

                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* AVATAR */}
            <Avatar className="h-50 w-50 ring-2 ring-background shadow-sm mt-6">
              <AvatarImage
                src={university.image || undefined}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                {university.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            
          </div>


    

        {/* HEADER */}
        <CardHeader className="text-center">
          <CardTitle className="text-lg font-bold line-clamp-1 px-1">
            {university.name}
          </CardTitle>
        </CardHeader>

        {/* CONTENT - flex-1 pushes the footer down */}
        <CardContent className="space-y-2">
          <CardDescription className="text-sm leading-relaxed line-clamp-2  px-2 ">
            {university.description || "No description available"}
          </CardDescription>

          <div className="space-y-2 ">
            <InfoItem
              label="Location"
              value={university.address || "No address"}
              icon={<MapPin className="h-4 w-4" />}
            />
            <InfoItem
              label="Phone number"
              value={university.phoneNumber || "No phone"}
              icon={<Phone className="h-4 w-4" />}
            />
          </div>
        </CardContent>

        {/* FOOTER */}
        <CardFooter className="p-0  ">
          <Button
            onClick={onClick}
            className="w-full justify-between"
          >
            View University
            <Eye className="h-4 w-4 transition-transform group-hover:scale-110" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}