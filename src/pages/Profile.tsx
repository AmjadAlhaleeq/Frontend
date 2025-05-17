// This is the Profile.tsx page. It handles UI and logic for Profile.

import { useState } from "react";
import {
  X,
  Edit,
  Check,
  Camera,
  CalendarCheck,
  CalendarClock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  MapPin,
  Medal,
  Star,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { useReservation } from "@/context/ReservationContext";
import { useLanguage } from "@/context/LanguageContext";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const userData = {
  id: "user1",
  name: "John Doe",
  username: "johndoe10",
  email: "john.doe@example.com",
  avatar: "https://i.pravatar.cc/150?img=65",
  joined: "January 2024",
  bio: "Football enthusiast. Sunday league midfielder with a passion for the beautiful game.",
  level: "Intermediate",
  preferredPosition: "Midfielder",
  achievements: [
    {
      name: "5-Game Streak",
      description: "Played 5 games in a row",
      icon: <TrendingUp className="h-5 w-5 text-orange-500" />,
    },
    {
      name: "MVP",
      description: "Voted Most Valuable Player twice",
      icon: <Trophy className="h-5 w-5 text-yellow-500" />,
    },
    {
      name: "Sharpshooter",
      description: "Scored 10+ goals this season",
      icon: <Zap className="h-5 w-5 text-bokit-500" />,
    },
  ],
  stats: {
    gamesPlayed: 28,
    goalsScored: 15,
    assists: 12,
    rating: 4.7,
    skillLevel: 78, // out of 100
    stamina: 82, // out of 100
    teamwork: 90, // out of 100
  },
};

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  bio: z.string().optional(),
  preferredPosition: z.string().optional(),
});

const Profile = () => {
  const { getUserReservations, cancelReservation } = useReservation();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPastGame, setSelectedPastGame] = useState<number | null>(null);
  const [isGameDetailsOpen, setIsGameDetailsOpen] = useState(false);
  const [isChangingAvatar, setIsChangingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(userData.avatar);
  const [userProfile, setUserProfile] = useState(userData);

  const userReservations = getUserReservations();

  const upcomingReservations = userReservations.filter(
    (r) => r.status !== "completed"
  );
  const pastReservations = userReservations.filter(
    (r) => r.status === "completed"
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: userProfile.name,
      username: userProfile.username,
      email: userProfile.email,
      bio: userProfile.bio,
      preferredPosition: userProfile.preferredPosition,
    },
  });

  const handleEditProfile = () => {
    form.reset({
      name: userProfile.name,
      username: userProfile.username,
      email: userProfile.email,
      bio: userProfile.bio,
      preferredPosition: userProfile.preferredPosition,
    });
    setIsEditing(true);
  };

  const handleSaveProfile = (values: z.infer<typeof formSchema>) => {
    setUserProfile({
      ...userProfile,
      ...values,
    });
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        setAvatarPreview(preview);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveAvatarChange = () => {
    setUserProfile((prev) => ({
      ...prev,
      avatar: avatarPreview,
    }));
    setIsChangingAvatar(false);
    toast({
      title: "Profile picture updated",
      description: "Your profile picture has been updated successfully.",
    });
  };

  const handleViewPastGameDetails = (id: number) => {
    setSelectedPastGame(id);
    setIsGameDetailsOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <div className="relative group mb-6">
                    <div className="relative">
                      <Avatar className="h-32 w-32 border-4 border-[#0F766E] shadow-xl group-hover:border-opacity-70 transition-all duration-300">
                        <AvatarImage
                          src={userProfile.avatar}
                          alt={userProfile.name}
                          className="object-cover"
                        />
                        <AvatarFallback>
                          {userProfile.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <button
                        onClick={() => setIsChangingAvatar(true)}
                        className="absolute bottom-0 right-0 bg-[#0F766E] text-white p-2 rounded-full shadow-lg hover:bg-[#0F766E]/80 transition-colors"
                      >
                        <Camera className="h-5 w-5" />
                      </button>
                      <Badge className="absolute bottom-1 left-0 bg-[#0F766E]">
                        {userProfile.level}
                      </Badge>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userProfile.name}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    @{userProfile.username}
                  </p>

                  <div className="w-full mt-6">
                    <Separator className="my-4" />

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 bg-[#0F766E]/10 dark:bg-[#0F766E]/20 rounded-lg">
                        <Users className="h-5 w-5 text-[#0F766E] mx-auto mb-1" />
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {userProfile.stats.gamesPlayed}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {t("profile.gamesPlayed")}
                        </div>
                      </div>
                      <div className="p-3 bg-[#0F766E]/10 dark:bg-[#0F766E]/20 rounded-lg">
                        <Star className="h-5 w-5 text-[#0F766E] mx-auto mb-1" />
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {userProfile.stats.rating}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {t("profile.rating")}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-6 bg-[#0F766E] hover:bg-[#0F766E]/90"
                    onClick={handleEditProfile}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {t("profile.editProfile")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("profile.achievements")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userProfile.achievements.map((achievement, idx) => (
                    <div
                      key={idx}
                      className="flex items-start p-3 bg-[#0F766E]/5 dark:bg-[#0F766E]/20 rounded-lg hover:bg-[#0F766E]/10 transition-colors"
                    >
                      <div className="bg-white dark:bg-gray-800 p-2 rounded-full mr-3 shadow-sm">
                        {achievement.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {achievement.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  {t("profile.statistics")}
                </CardTitle>
                <CardDescription>{t("profile.gameHistory")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-8">
                  <StatCard
                    icon={<Users className="h-5 w-5 text-[#0F766E]" />}
                    value={userProfile.stats.gamesPlayed}
                    label={t("profile.gamesPlayed")}
                  />
                  <StatCard
                    icon={<Zap className="h-5 w-5 text-[#0F766E]" />}
                    value={userProfile.stats.goalsScored}
                    label={t("profile.goals")}
                  />
                  <StatCard
                    icon={<TrendingUp className="h-5 w-5 text-[#0F766E]" />}
                    value={userProfile.stats.assists}
                    label={t("profile.assists")}
                  />
                  <StatCard
                    icon={<Star className="h-5 w-5 text-yellow-500" />}
                    value={userProfile.stats.rating}
                    label={t("profile.rating")}
                  />
                </div>

                <div className="space-y-6">
                  <ProgressStat
                    label={t("profile.skillLevel")}
                    value={userProfile.stats.skillLevel}
                    color="green"
                  />
                  <ProgressStat
                    label={t("profile.stamina")}
                    value={userProfile.stats.stamina}
                    color="amber"
                  />
                  <ProgressStat
                    label={t("profile.teamwork")}
                    value={userProfile.stats.teamwork}
                    color="green"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  {t("reservations.title")}
                </CardTitle>
                <CardDescription>{t("profile.joinGame")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="upcoming" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="upcoming">
                      <CalendarClock className="h-4 w-4 mr-2" />
                      {t("reservations.upcoming")} (
                      {upcomingReservations.length})
                    </TabsTrigger>
                    <TabsTrigger value="past">
                      <CalendarCheck className="h-4 w-4 mr-2" />
                      {t("reservations.past")} ({pastReservations.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upcoming">
                    {upcomingReservations.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingReservations.map((reservation) => (
                          <div
                            key={reservation.id}
                            className="bg-white dark:bg-gray-800 border rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between mb-2">
                              <h3 className="font-medium">
                                {reservation.pitchName}
                              </h3>
                              <Badge
                                className={
                                  reservation.status === "open"
                                    ? "bg-green-500"
                                    : "bg-orange-500"
                                }
                              >
                                {t(`reservations.${reservation.status}`)}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-3">
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-4 w-4 mr-1.5 text-[#0F766E]" />
                                {formatDate(reservation.date, language)}
                              </div>

                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="h-4 w-4 mr-1.5 text-[#0F766E]" />
                                {reservation.time}
                              </div>

                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="h-4 w-4 mr-1.5 text-[#0F766E]" />
                                {reservation.location}
                              </div>

                              <div className="flex items-center text-sm text-gray-600">
                                <Users className="h-4 w-4 mr-1.5 text-[#0F766E]" />
                                {reservation.playersJoined}/
                                {reservation.maxPlayers} {t("pitches.players")}
                              </div>
                            </div>

                            <div className="flex justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                                onClick={() =>
                                  cancelReservation(reservation.id)
                                }
                              >
                                <X className="h-4 w-4 mr-1" />{" "}
                                {t("reservations.cancel")}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CalendarClock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">
                          {t("profile.noUpcomingGames")}
                        </p>
                        <Button
                          className="mt-4 bg-[#0F766E] hover:bg-[#0F766E]/90"
                          onClick={() =>
                            (window.location.href = "/reservations")
                          }
                        >
                          {t("pitches.viewAllReservations")}
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="past">
                    {pastReservations.length > 0 ? (
                      <div className="space-y-4">
                        {pastReservations.map((reservation) => (
                          <div
                            key={reservation.id}
                            className="bg-white dark:bg-gray-800 border rounded-lg p-4"
                          >
                            <div className="flex justify-between mb-2">
                              <h3 className="font-medium">
                                {reservation.pitchName}
                              </h3>
                              <div className="flex items-center">
                                <Medal className="h-4 w-4 text-yellow-500 mr-1" />
                                <span className="text-sm">
                                  {t("profile.greatGame")}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-3">
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-4 w-4 mr-1.5 text-[#0F766E]" />
                                {formatDate(reservation.date, language)}
                              </div>

                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="h-4 w-4 mr-1.5 text-[#0F766E]" />
                                {reservation.time}
                              </div>
                            </div>

                            <div className="flex justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleViewPastGameDetails(reservation.id)
                                }
                              >
                                {t("reservations.details")}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CalendarCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">
                          {t("profile.noPastGames")}
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("profile.editProfile")}</DialogTitle>
            <DialogDescription>
              {t("profile.editProfileDescription")}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSaveProfile)}
              className="space-y-4"
            >
              <div className="flex justify-center mb-6">
                <Avatar className="h-24 w-24 border-4 border-[#0F766E]">
                  <AvatarImage src={userProfile.avatar} />
                  <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>

              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("profile.name")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("profile.username")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("profile.email")}</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("profile.bio")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferredPosition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("profile.preferredPosition")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                >
                  <X className="h-4 w-4 mr-2" />
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  className="bg-[#0F766E] hover:bg-[#0F766E]/90"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {t("common.save")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isChangingAvatar} onOpenChange={setIsChangingAvatar}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
            <DialogDescription>Choose a new profile picture</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32 border-4 border-[#0F766E]">
                <AvatarImage src={avatarPreview} />
                <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex gap-2">
                <label className="flex items-center gap-2 bg-[#0F766E] text-white px-4 py-2 rounded-md cursor-pointer hover:bg-[#0F766E]/90 transition-colors">
                  <Camera className="h-5 w-5" />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[65, 66, 67, 68, 69, 70, 71, 72].map((idx) => (
                <button
                  key={idx}
                  className={`rounded-md overflow-hidden border-2 ${
                    avatarPreview === `https://i.pravatar.cc/150?img=${idx}`
                      ? "border-[#0F766E]"
                      : "border-transparent"
                  }`}
                  onClick={() =>
                    setAvatarPreview(`https://i.pravatar.cc/150?img=${idx}`)
                  }
                >
                  <img
                    src={`https://i.pravatar.cc/150?img=${idx}`}
                    alt={`Avatar option ${idx}`}
                    className="w-full h-full object-cover aspect-square"
                  />
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAvatarPreview(userProfile.avatar);
                setIsChangingAvatar(false);
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#0F766E] hover:bg-[#0F766E]/90"
              onClick={saveAvatarChange}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isGameDetailsOpen} onOpenChange={setIsGameDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Game Details</DialogTitle>
            <DialogDescription>
              {selectedPastGame &&
                (() => {
                  const game = pastReservations.find(
                    (r) => r.id === selectedPastGame
                  );
                  return game ? formatDate(game.date, language) : "";
                })()}
            </DialogDescription>
          </DialogHeader>

          {selectedPastGame &&
            (() => {
              const game = pastReservations.find(
                (r) => r.id === selectedPastGame
              );
              if (!game) return null;

              return (
                <div className="space-y-4">
                  <div className="bg-[#0F766E]/10 dark:bg-[#0F766E]/20 p-4 rounded-lg shadow-md">
                    <h3 className="font-medium mb-2 text-[#0F766E] dark:text-[#0F766E]/90">
                      {game.pitchName}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-[#0F766E] mr-2" />
                        <span>{game.time}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-[#0F766E] mr-2" />
                        <span>{game.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-[#0F766E] mr-2" />
                        <span>{game.playersJoined} players</span>
                      </div>
                      <div className="flex items-center">
                        <Trophy className="h-4 w-4 text-amber-500 mr-2" />
                        <span>Final Score: 3-2</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Game Highlights</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <div className="w-24 text-muted-foreground">14'</div>
                        <div>Goal by John D.</div>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-24 text-muted-foreground">32'</div>
                        <div>Yellow card for Michael S.</div>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-24 text-muted-foreground">47'</div>
                        <div>Goal by Sarah L.</div>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-24 text-muted-foreground">63'</div>
                        <div>Goal by Alex P.</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">MVP and Top Players</h4>
                    <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-3 rounded-lg flex items-center mb-3">
                      <div className="bg-amber-200 dark:bg-amber-700 rounded-full p-2 mr-3">
                        <Star className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                      </div>
                      <div>
                        <div className="font-medium">Sarah L.</div>
                        <div className="text-xs text-muted-foreground">
                          MVP with 2 goals and 1 assist
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg flex items-center">
                        <Users className="h-4 w-4 text-[#0F766E] mr-2" />
                        <div className="text-sm">
                          <div>John D.</div>
                          <div className="text-xs text-muted-foreground">
                            1 goal
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg flex items-center">
                        <Users className="h-4 w-4 text-[#0F766E] mr-2" />
                        <div className="text-sm">
                          <div>Alex P.</div>
                          <div className="text-xs text-muted-foreground">
                            1 goal, 1 assist
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-sm text-muted-foreground pt-2 border-t">
                    <p>
                      Game completed on{" "}
                      {new Date(game.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              );
            })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const StatCard = ({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
}) => (
  <div className="p-4 bg-[#0F766E]/10 dark:bg-[#0F766E]/20 rounded-lg">
    <div className="flex justify-center mb-2">{icon}</div>
    <div className="text-2xl font-bold text-gray-900 dark:text-white">
      {value}
    </div>
    <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
  </div>
);

const ProgressStat = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "default" | "green" | "amber" | "red";
}) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {value}/100
      </span>
    </div>
    <Progress value={value} className="h-2" indicatorColor={color} />
  </div>
);

const formatDate = (dateString: string, language: string) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString(
    language === "ar" ? "ar-SA" : "en-US",
    options
  );
};

export default Profile;
