
```
Függvény Maximum(v:Verem[Egész]): Egész
	Lokális változók:
		s: Verem[Egész]
		best: Egész
	
	best:= Verem.Teteje()
	s.Verembe(v.Veremből())
	
	Ciklus amíg !v.Üres()
		ha best < v.Teteje()
			best := v.Teteje()
		Elágazás vége
		s.Verembe(v.Veremből())
	Ciklus vége
	
	Ciklus amíg !s.Üres()
		v.Verembe(s.Veremből())
	Ciklus vége
	
	Maximum:= best
FÜggvény vége
```

102 304 + 24 - 2* 
406 24 - 2*
382 2*
764

((102 + 304) - 24 ) * 2

```
Függvény Count_Paros(v:Verem[Egész]): Egész
	Lokális változók:
		s: Verem[Egész]
		db: Egész
	
	best:= Verem.Teteje()
	
	Ciklus amíg !v.Üres()
		ha páros(v.Teteje)
			db++
		Elágazás vége
		s.Verembe(v.Veremből())
	Ciklus vége
	
	Ciklus amíg !s.Üres()
		v.Verembe(s.Veremből())
	Ciklus vége
	
	Count_Paros:= best
FÜggvény vége
```

```
Függvény Hozzaad5(v: Verem[Egész]): Verem[Egész]
    Lokális változók:
        s, u: Verem[Egész]
        x: Egész
        
    Ciklus amíg !v.Üres()
        x := v.Veremből()
        s.Verembe(x)
    Ciklus vége
    
    Ciklus amíg !s.Üres()
        x := s.Veremből()
        v.Verembe(x)
        u.Verembe(x + 5)
    Ciklus vége
    
    Hozzaad5 := u
Függvény vége
```