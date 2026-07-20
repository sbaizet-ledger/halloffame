#!/usr/bin/env python3
"""Test badge display in Hall of Fame app"""

from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    print("Loading http://localhost:3000...")
    page.goto('http://localhost:3000')
    page.wait_for_load_state('networkidle')
    
    print("Taking screenshot...")
    page.screenshot(path='/tmp/halloffame-badges.png', full_page=True)
    print("Screenshot saved to /tmp/halloffame-badges.png")
    
    # Check if badges are present in DOM
    print("\nChecking for badge icons...")
    badge_icons = page.locator('[role="img"]').all()
    print(f"Found {len(badge_icons)} emoji/icons on page")
    
    # Check for marathon emoji specifically
    content = page.content()
    if '🏃' in content:
        print("✅ Marathon badge emoji found on page")
    else:
        print("⚠️  Marathon badge emoji not found")
    
    # Check if badge-icon components rendered
    badge_containers = page.locator('span[title*="badge" i], span[title*="marathon" i]').all()
    if badge_containers:
        print(f"✅ Found {len(badge_containers)} badge tooltip elements")
        for i, container in enumerate(badge_containers[:3]):  # Show first 3
            title = container.get_attribute('title')
            print(f"  - Badge {i+1}: {title}")
    else:
        print("⚠️  No badge tooltip elements found")
    
    browser.close()
    print("\nTest complete!")
