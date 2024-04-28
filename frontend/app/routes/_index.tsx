import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import type { MetaFunction } from "@remix-run/node";
import {
  ClientActionFunctionArgs,
  ClientLoaderFunctionArgs,
  Form,
  Link,
  useFetcher,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import { Loader2, Menu, Package2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { toast } from "sonner";
import { CsvData } from "~/types";
import { useDebounceValue } from "usehooks-ts";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix SPA" },
    { name: "description", content: "Welcome to Remix (SPA Mode)!" },
  ];
};

const uploadSchema = z.object({
  file: z
    .any()
    .refine((value) => value instanceof File && value.name.endsWith(".csv"), {
      message: "A CSV file is required",
    }),
});

export async function clientLoader({ request }: ClientLoaderFunctionArgs) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const response = await fetch(`http://localhost:3000/api/users?q=${query}`);

  if (!response.ok) {
    const responseJson = await response.json();
    return { success: false, message: responseJson.message, data: [] } as {
      success: boolean;
      message: "";
      data: CsvData[];
    };
  }

  const { data } = await response.json();
  return { success: true, message: "", data } as {
    success: boolean;
    message: "";
    data: CsvData[];
  };
}

export async function clientAction({ request }: ClientActionFunctionArgs) {
  const formData = await request.formData();
  const _action = z.string().parse(formData.get("_action"));

  if (_action === "upload") {
    const submission = parseWithZod(formData, { schema: uploadSchema });

    if (submission.status !== "success") {
      return submission.reply();
    }

    const file = formData.get("file");
    const body = new FormData();
    body.append("file", file as Blob);
    const response = await fetch("http://localhost:3000/api/files", {
      method: "POST",
      body,
    });

    const responseJson = await response.json();
    toast(responseJson.message);
    return submission.reply({ resetForm: true });
  }

  return null;
}

export default function Index() {
  const { data, message, success } = useLoaderData<typeof clientLoader>();
  const uploadFetcher = useFetcher<typeof clientAction>();
  const [form, fields] = useForm({
    lastResult: uploadFetcher.data,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: uploadSchema });
    },
    shouldValidate: "onSubmit",
    shouldRevalidate: "onInput",
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(() => {
    return searchParams.get("query") ?? "";
  });
  const [debouncedQuery] = useDebounceValue(query, 1000);

  useEffect(() => {
    setSearchParams({ q: debouncedQuery });
  }, [debouncedQuery, setSearchParams]);

  useEffect(() => {
    if (!success) {
      toast(message);
    }
  }, [success, message]);

  const isLoading = uploadFetcher.state === "submitting";

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <Package2 className="h-6 w-6" />
            <span className="sr-only">Skill Test</span>
          </Link>
          <Link
            to="#"
            className="text-foreground transition-colors hover:text-foreground"
          >
            Skill Test
          </Link>
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Skill Test</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                to="/"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <Package2 className="h-6 w-6" />
                <span className="sr-only">Skill Test</span>
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-muted/40">
        <div className="grid gap-4 md:grid-cols-1 md:gap-8 lg:grid-cols-1">
          <Card className="">
            <CardHeader>
              <CardTitle className="text-2xl">Upload the CSV file</CardTitle>
              <CardDescription className="sr-only">
                Pick your file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <uploadFetcher.Form
                className="grid gap-4"
                method="post"
                encType="multipart/form-data"
                id={form.id}
                onSubmit={form.onSubmit}
              >
                <div className="grid gap-2">
                  <Label htmlFor="file">Pick your file</Label>
                  <Input
                    name={fields.file.name}
                    id={fields.file.id}
                    required={fields.file.required}
                    key={fields.file.key}
                    type="file"
                    defaultValue=""
                  />
                  <div className="text-sm text-muted-foreground">
                    {fields.file.errors}
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  name="_action"
                  value="upload"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading
                    </>
                  )}
                  {!isLoading && `Upload`}
                </Button>
              </uploadFetcher.Form>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-1 md:gap-8 lg:grid-cols-1">
          <Card className="">
            <CardHeader>
              <CardTitle className="text-2xl">Search in cards</CardTitle>
              <CardDescription className="sr-only">
                Search in the existing card
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form className="grid gap-4" method="get">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="file"
                    defaultValue={query}
                    type="search"
                    placeholder="Search..."
                    className="w-full rounded-lg bg-background pl-8"
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          {data.length > 0 &&
            data.map((item, index) => (
              <Card key={`${item.id}-${index}`} className="card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {item.id}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{item.name}</div>
                  <p className="text-xs text-muted-foreground">{item.email}</p>
                </CardContent>
              </Card>
            ))}
        </div>
      </main>
    </div>
  );
}
