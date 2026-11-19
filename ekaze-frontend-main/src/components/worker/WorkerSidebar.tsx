import {
  LayoutDashboard,
  User,
  Bell,
  History,
  Star,
  LogOut,
  Briefcase,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import logo from "@/assets/reallogo.png";

interface WorkerSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: "overview", title: "Overview", icon: LayoutDashboard },
  { id: "profile", title: "My Profile", icon: User },
  { id: "notifications", title: "Job Notifications", icon: Bell, badge: 3 },
  { id: "history", title: "Employment History", icon: History },
  { id: "ratings", title: "My Ratings", icon: Star },
];

const WorkerSidebar = ({ activeTab, setActiveTab }: WorkerSidebarProps) => {
  const navigate = useNavigate();

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Ekaze" className="h-10 w-auto" />
          {/* {!isCollapsed && (
            <span className="font-display font-bold text-lg text-sidebar-foreground">
              Ekaze
            </span>
          )} */}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id} className=" py-3" >
                  <SidebarMenuButton
                    onClick={() => setActiveTab(item.id)}
                    isActive={activeTab === item.id}
                    className="w-full justify-start py-2"
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    <span className="flex-1 text-left">{item.title}</span>
                    {item.badge && (
                      <Badge className="ml-auto text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-4">
          <Avatar>
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/10 text-primary">
              CI
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              Claudine Ingabire
            </p>
            <p className="text-xs text-muted-foreground">Freelance Worker</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => navigate("/")}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default WorkerSidebar;
