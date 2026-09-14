"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PROVIDERS } from "@/lib/foundercycle";
import { saveProfile, saveConnections } from "@/lib/store";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [context, setContext] = useState("");
  const [conns, setConns] = useState<Record<string, boolean>>({});

  function finish() {
    if (!name.trim()) return;
    saveProfile({ name: name.trim(), context });
    saveConnections(conns);
    // persist server-side too (best effort)
    fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), context }),
    }).catch(() => {});
    router.push("/");
  }

  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <Card className="w-full max-w-md rounded-xl">
        <CardHeader>
          <CardTitle>
            {step === 1 ? "Founder setup" : "Connect apps"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {step === 1 ? (
            <>
              <Input
                placeholder="Founder name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Textarea
                placeholder="Context: company, focus, timezone…"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={4}
              />
              <Button disabled={!name.trim()} onClick={() => setStep(2)}>
                Continue
              </Button>
            </>
          ) : (
            <>
              {PROVIDERS.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between border px-3 py-2"
                >
                  <span className="text-sm font-medium">{p.label}</span>
                  <Switch
                    checked={!!conns[p.id]}
                    onCheckedChange={() =>
                      setConns((c) => ({ ...c, [p.id]: !c[p.id] }))
                    }
                  />
                </div>
              ))}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button className="flex-1" onClick={finish}>
                  Enter FounderCycle
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
