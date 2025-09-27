"use client";

import { href, useNavigation, useSearchParams } from "react-router";
import { NavLinkSub } from "~/components/domain/nav";
import { Waver } from "~/components/icons/waver";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export function Selector({ year }: { year: number }) {
  const [params, setParams] = useSearchParams();

  return (
    <Select
      value={year.toString()}
      onValueChange={(data) => {
        setParams(
          { ...Object.fromEntries(params), year: data },
          {
            preventScrollReset: true,
          },
        );
      }}
    >
      <SelectTrigger className="min-w-[100px]">
        <SelectValue placeholder="Year" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="2025">2025</SelectItem>
        <SelectItem value="2024">2024</SelectItem>
        <SelectItem value="2023">2023</SelectItem>
        <SelectItem value="2022">2022</SelectItem>
        <SelectItem value="2021">2021</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function Loader() {
  const navigation = useNavigation();

  return <div>{navigation.state === "loading" && <Waver />}</div>;
}

export function Links({ userId }: { userId: string }) {
  return (
    <>
      <NavLinkSub
        to={href("/profile/:userId?", {
          userId,
        })}
      >
        Top
      </NavLinkSub>
      <NavLinkSub to="liked">Liked</NavLinkSub>
      <NavLinkSub to="recent">Listened</NavLinkSub>
    </>
  );
}

export function TopSelector({ type, range }: { type: string; range: string }) {
  const [params, setParams] = useSearchParams();

  return (
    <div className="flex h-12 items-center gap-2">
      <p className="text-muted-foreground text-sm">Top</p>
      <Select
        defaultValue={type}
        onValueChange={(data) => {
          setParams(
            { ...Object.fromEntries(params), type: data },
            {
              preventScrollReset: true,
            },
          );
        }}
      >
        <SelectTrigger className="min-w-[100px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="songs">Songs</SelectItem>
          <SelectItem value="artists">Artists</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={range}
        onValueChange={(data) => {
          setParams(
            { ...Object.fromEntries(params), range: data },
            {
              preventScrollReset: true,
            },
          );
        }}
      >
        <SelectTrigger className="min-w-[100px]">
          <SelectValue placeholder="Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="long_term">Year</SelectItem>
          <SelectItem value="medium_term">Half Year</SelectItem>
          <SelectItem value="short_term">Month</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
