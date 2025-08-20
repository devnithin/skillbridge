import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();

  const loginForm = useForm({
    resolver: zodResolver(insertUserSchema.pick({ username: true, password: true })),
  });

  const registerForm = useForm({
    resolver: zodResolver(insertUserSchema),
  });

  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <Card className="w-full max-w-sm sm:max-w-md shadow-xl border-primary/10">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 h-11 sm:h-12">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <CardContent className="pt-6 px-6 sm:px-8">
                <form onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))}>
                  <div className="space-y-4 sm:space-y-5">
                    <div>
                      <Label htmlFor="login-username">Username</Label>
                      <Input id="login-username" {...loginForm.register("username")} />
                    </div>
                    <div>
                      <Label htmlFor="login-password">Password</Label>
                      <Input id="login-password" type="password" {...loginForm.register("password")} />
                    </div>
                    <Button type="submit" className="w-full h-11 sm:h-12 text-base" disabled={loginMutation.isPending}>
                      {loginMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="register">
              <CardContent className="pt-6 px-6 sm:px-8">
                <form onSubmit={registerForm.handleSubmit((data) => registerMutation.mutate(data))}>
                  <div className="space-y-4 sm:space-y-5">
                    <div>
                      <Label htmlFor="register-username">Username</Label>
                      <Input id="register-username" {...registerForm.register("username")} />
                    </div>
                    <div>
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        {...registerForm.register("password")}
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-fullname">Full Name</Label>
                      <Input id="register-fullname" {...registerForm.register("fullName")} />
                    </div>
                    <div>
                      <Label htmlFor="register-email">Email</Label>
                      <Input id="register-email" type="email" {...registerForm.register("email")} />
                    </div>
                    <div>
                      <Label htmlFor="register-phone">Phone (optional)</Label>
                      <Input id="register-phone" {...registerForm.register("phone")} />
                    </div>
                    <Button type="submit" className="w-full h-11 sm:h-12 text-base" disabled={registerMutation.isPending}>
                      {registerMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Register"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      <div className="hidden lg:flex flex-1 bg-[#0077B5] text-white p-8 xl:p-12 items-center">
        <div className="max-w-lg">
          <h1 className="text-3xl xl:text-4xl font-bold mb-4 xl:mb-6">Welcome to SkillBridge</h1>
          <p className="text-base xl:text-lg mb-6 xl:mb-8">
            Connect with others to learn and share skills. Join our community of lifelong learners
            today.
          </p>
          <ul className="space-y-3 xl:space-y-4">
            <li className="flex items-center gap-2">
              <span className="text-[#7FC15E]">✓</span> Find mentors in your field
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#7FC15E]">✓</span> Share your expertise
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#7FC15E]">✓</span> Grow your network
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
