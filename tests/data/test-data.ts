export const parseKeyHeadTestText =
	"A beast in the sea" +
	" .X.2.6:6.28:abc def:12. %m %n.2:4 %p.dot_sub^sup:22:44:77 $abc $def xyz >kg.m/s2" +
	" .Y:2 %x.2:2 %y_2^4 .Z %g";

export const expectedParseKeyHeadTestTextReport = `
	Key: A beast in the sea
	Types: 
		Type: .X
		Name param: 
			.X
				dotParam: 2.6 in .R:2:9
				colonParams:
					6.28 in .R:3:9
					abc def in .$
					12 in .R:2:9
		Flags: 
			%m
			%n
				dotParam: 2 in .Z
				colonParams:
					4 in .Z
			%p
				dotParam: dot in .$
				subParam: sub in .$
				superParam: sup in .$
				colonParams:
					22 in .Z
					44 in .Z
					77 in .Z
		String params: 
			abc
			def xyz
		Unit param: kg.m/s2

		Type: .Y
		Name param: 
			.Y
				colonParams:
					2 in .Z
		Flags: 
			%x
				dotParam: 2 in .Z
				colonParams:
					2 in .Z
			%y
				subParam: 2 in .Z
				superParam: 4 in .Z

		Type: .Z
		Name param: 
			.Z
		Flags: 
			%g
`;
