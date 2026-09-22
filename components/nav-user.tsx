"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client"

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")

  return initials.toUpperCase()
}

type NavUserProps = {
  name: string
  email: string
}

export function NavUser({ name, email }: NavUserProps) {
  const router = useRouter()
  const { isMobile } = useSidebar()

  const handleSignOut = async () => {
    await authClient.signOut()
    router.replace("/sign-in")
    router.refresh()
  }

  const triggerContent = (
    <>
      <Avatar className="rounded-lg">
        <AvatarFallback className="rounded-lg bg-violet-600 text-white">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">{name}</span>
        <span className="truncate text-xs text-sidebar-foreground/70">
          {email}
        </span>
      </div>
    </>
  )

  const triggerClassName =
    "data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"

  const logOutButton = (
    <Button
      type="button"
      variant="ghost"
      onClick={handleSignOut}
      className="w-full justify-start gap-2"
    >
      <LogOut className="size-4" />
      Log out
    </Button>
  )

  if (isMobile) {
    return (
      <Drawer>
        <SidebarMenuButton
          size="lg"
          render={<DrawerTrigger />}
          className={triggerClassName}
        >
          {triggerContent}
        </SidebarMenuButton>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{name}</DrawerTitle>
            <DrawerDescription>{email}</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>{logOutButton}</DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Popover>
      <SidebarMenuButton
        size="lg"
        render={<PopoverTrigger />}
        className={triggerClassName}
      >
        {triggerContent}
      </SidebarMenuButton>
      <PopoverContent side="right" align="end" className="w-auto p-1">
        {logOutButton}
      </PopoverContent>
    </Popover>
  )
}
