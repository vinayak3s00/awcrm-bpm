// AWCRM Contact Card Component - Modern, Clean UI
// Reusable contact card with smooth animations and interactions

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/libs/utils';
import type { Contact } from '../types/contact.types';

interface ContactCardProps {
  contact: Contact;
  onView?: (contact: Contact) => void;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

const statusColors = {
  active: 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200 shadow-emerald-100',
  inactive: 'bg-gradient-to-r from-slate-50 to-gray-50 text-slate-600 border-slate-200 shadow-slate-100',
  prospect: 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 shadow-blue-100',
} as const;

const statusLabels = {
  active: 'Active',
  inactive: 'Inactive',
  prospect: 'Prospect',
} as const;

export function ContactCard({
  contact,
  onView,
  onEdit,
  onDelete,
  className,
  variant = 'default',
}: ContactCardProps) {
  const fullName = `${contact.firstName} ${contact.lastName}`;
  const initials = `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase();

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    hover: {
      y: -4,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: 'easeInOut'
      }
    }
  };

  const handleAction = (action: () => void, event: React.MouseEvent) => {
    event.stopPropagation();
    action();
  };

  if (variant === 'compact') {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className={cn(
          'group relative bg-white border border-slate-200 rounded-lg p-4',
          'hover:border-slate-300 hover:shadow-md transition-all duration-200',
          'cursor-pointer',
          className
        )}
        onClick={() => onView?.(contact)}
      >
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={contact.avatarUrl} alt={fullName} />
            <AvatarFallback className="bg-blue-600 text-white font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-slate-900 truncate">
              {fullName}
            </h3>
            <p className="text-sm text-slate-500 truncate">
              {contact.company || contact.email || 'No company'}
            </p>
          </div>

          <Badge
            variant="outline"
            className={cn('text-xs', statusColors[contact.status])}
          >
            {statusLabels[contact.status]}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={(e) => handleAction(() => onView?.(contact), e)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleAction(() => onEdit?.(contact), e)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Contact
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={(e) => handleAction(() => onDelete?.(contact), e)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Contact
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={cn(
        'group relative bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6',
        'hover:border-blue-300/60 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300',
        'cursor-pointer overflow-hidden',
        'before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-50/30 before:to-indigo-50/20 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100',
        className
      )}
      onClick={() => onView?.(contact)}
    >
      {/* Header */}
      <div className="relative z-10 flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Avatar className="h-14 w-14 ring-3 ring-white shadow-xl">
              <AvatarImage src={contact.avatarUrl} alt={fullName} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className={cn(
              'absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-white shadow-lg',
              contact.status === 'active' ? 'bg-emerald-500' :
              contact.status === 'prospect' ? 'bg-blue-500' : 'bg-slate-400'
            )}></div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              {fullName}
            </h3>
            {contact.jobTitle && (
              <p className="text-sm font-medium text-slate-600">{contact.jobTitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Badge
            variant="outline"
            className={cn('text-xs font-semibold shadow-sm', statusColors[contact.status])}
          >
            {statusLabels[contact.status]}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={(e) => handleAction(() => onView?.(contact), e)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleAction(() => onEdit?.(contact), e)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Contact
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={(e) => handleAction(() => onDelete?.(contact), e)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Contact
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Contact Information */}
      <div className="relative z-10 space-y-3">
        {contact.email && (
          <div className="flex items-center text-sm text-slate-700 bg-slate-50/50 rounded-lg p-3 hover:bg-slate-100/50 transition-colors">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <Mail className="h-4 w-4 text-blue-600" />
            </div>
            <span className="truncate font-medium">{contact.email}</span>
          </div>
        )}

        {contact.phone && (
          <div className="flex items-center text-sm text-slate-700 bg-slate-50/50 rounded-lg p-3 hover:bg-slate-100/50 transition-colors">
            <div className="bg-emerald-100 p-2 rounded-lg mr-3">
              <Phone className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="font-medium">{contact.phone}</span>
          </div>
        )}

        {contact.company && (
          <div className="flex items-center text-sm text-slate-700 bg-slate-50/50 rounded-lg p-3 hover:bg-slate-100/50 transition-colors">
            <div className="bg-purple-100 p-2 rounded-lg mr-3">
              <Building2 className="h-4 w-4 text-purple-600" />
            </div>
            <span className="truncate font-medium">{contact.company}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {contact.tags && contact.tags.length > 0 && (
        <div className="relative z-10 mt-5 flex flex-wrap gap-2">
          {contact.tags.slice(0, 3).map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-xs bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 hover:from-slate-200 hover:to-slate-100 border border-slate-200 shadow-sm font-medium"
            >
              {tag}
            </Badge>
          ))}
          {contact.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200 shadow-sm font-medium">
              +{contact.tags.length - 3} more
            </Badge>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="relative z-10 mt-6 pt-4 border-t border-slate-200/60">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Added {new Date(contact.createdAt).toLocaleDateString()}
          </span>
          {contact.source && (
            <span className="bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 px-3 py-1 rounded-full font-medium border border-indigo-200 shadow-sm">
              {contact.source}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
