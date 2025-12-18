'use client'

import { ChevronRight, type LucideIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

export interface NavItem {
  title: string
  href?: string
  icon?: LucideIcon
  items?: NavItem[]
  badge?: string
}

interface NavProps {
  items: NavItem[]
  pathname: string
}

export function Nav({ items, pathname }: NavProps) {
  return (
    <nav className="grid gap-1">
      {items.map((item, index) => (
        <NavItem key={index} item={item} pathname={pathname} />
      ))}
    </nav>
  )
}

function NavItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const [open, setOpen] = React.useState(false)
  const Icon = item.icon

  const isActive = item.href === pathname || 
    (item.items && item.items.some(subItem => subItem.href === pathname))

  if (item.items) {
    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant={isActive ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start',
              isActive && 'bg-muted'
            )}
          >
            {Icon && <Icon className="mr-2 h-4 w-4" />}
            <span className="flex-1 text-left">{item.title}</span>
            <ChevronRight
              className={cn(
                'h-4 w-4 transition-transform',
                open && 'rotate-90'
              )}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-6 pt-1">
          <div className="grid gap-1">
            {item.items.map((subItem, index) => (
              <NavItem key={index} item={subItem} pathname={pathname} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      className={cn(
        'w-full justify-start',
        isActive && 'bg-muted'
      )}
      asChild
    >
      <a href={item.href}>
        {Icon && <Icon className="mr-2 h-4 w-4" />}
        {item.title}
        {item.badge && (
          <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
            {item.badge}
          </span>
        )}
      </a>
    </Button>
  )
}
