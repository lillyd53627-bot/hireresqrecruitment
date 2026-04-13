<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title>HireResQ AI</title>

    <!-- ✅ Paystack (LIVE) -->
    <script src="https://js.paystack.co/v1/inline.js"></script>

    <!-- ✅ Optional: Preconnect for performance -->
    <link rel="preconnect" href="https://tlzipklqaxiupbhggbnm.supabase.co" />

    <!-- ✅ Favicon -->
    <link rel="icon" type="image/png" href="/favicon.png" />

    <!-- ✅ Global Config (VERY IMPORTANT) -->
    <script>
      window.ENV = {
        SUPABASE_URL: "https://tlzipklqaxiupbhggbnm.supabase.co",
        SUPABASE_ANON_KEY:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsemlwa2xxYXhpdXBiaGdnYm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NjYwMjMsImV4cCI6MjA5MDE0MjAyM30.N-9NaDds_ZZ2sfL8Tp-WX_NRH2UOjzNrIbRbBpUcGPo",

        PAYSTACK_PUBLIC_KEY:
          "pk_live_cc5867f5fb5677cf09c944f61d1bc5692e8bb46e",
      };
    </script>
  </head>

  <body>
    <div id="root"></div>

    <!-- ✅ React App Entry -->
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>